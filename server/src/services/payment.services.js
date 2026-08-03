
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MP_ACCESS_TOKEN, FRONTEND_URL, MP_WEBHOOK_URL } from '../config.js';
import Order from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { User } from '../models/User.js';
import { Seat } from '../models/Seats.js';
import { Products } from '../models/Products.js';
import { MovieShowing } from '../models/MovieShowing.js';
import { sendRefundEmail, sendPaymentSuccessEmail } from './email.services.js';
import { sequelize } from '../db.js';


export const parseSeats = (seats) => {
    if (!seats) return [];
    if (Array.isArray(seats)) return seats.map(s => String(s).trim()).filter(Boolean);
    if (typeof seats === 'string') {
        try {
            const parsed = JSON.parse(seats);
            if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
            if (typeof parsed === 'string') return [parsed.trim()].filter(Boolean);
        } catch {
            return seats.split(',').map(s => String(s).trim()).filter(Boolean);
        }
    }
    return [];
};


export const processOrderRefund = async (orderInput, transaction) => {
    let order = orderInput;
    if (transaction && orderInput?.id) {
        const freshOrder = await Order.findByPk(orderInput.id, {
            include: [{ model: OrderItem, as: 'orderItems' }],
            transaction,
            lock: transaction.LOCK.UPDATE
        });
        if (freshOrder) {
            order = freshOrder;
        }
    }

    // Idempotency check: if order is already refunded, do nothing to prevent duplicate stock additions or seat releases
    if (order.status === 'refunded') {
        return order;
    }

    let orderItems = order.orderItems || order.OrderItems;
    if (!orderItems || orderItems.length === 0) {
        orderItems = await OrderItem.findAll({ where: { orderId: order.id }, transaction });
    }

    for (const item of (orderItems || [])) {
        if (item.type === 'product') {
            const product = await Products.findByPk(item.refId, { transaction });
            if (product) {
                product.stock = (product.stock || 0) + item.quantity;
                await product.save({ transaction });
            }
        } else if (item.type === 'ticket') {
            const seatLabels = parseSeats(item.seats);
            if (seatLabels.length > 0) {
                await Seat.update(
                    { status: 'Libre' },
                    { 
                        where: { showingId: item.refId, label: seatLabels },
                        transaction 
                    }
                );
            }
        }
    }

    await order.update({ status: 'refunded', mpStatus: 'refunded' }, { transaction });
    order.status = 'refunded';
    order.mpStatus = 'refunded';
    return order;
};


const client = MP_ACCESS_TOKEN 
    ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
    : null;


export const createPreference = async (req, res) => 
{
    try 
    {
        const { orderId } = req.body;
        const userId = req.user?.id;

        if (!orderId) 
        {
            return res.status(400).json({ message: "orderId es requerido" });
        }

        if (!client) 
        {
            return res.status(503).json({ message: "Mercado Pago no está configurado" });
        }

        const order = await Order.findByPk(orderId, { include: [{ model: OrderItem, as: 'orderItems' }] });

        if (!order) 
        {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        if (String(order.userId) !== String(userId)) 
        {
            return res.status(403).json({ message: "No autorizado" });
        }

        if (order.status === 'paid') 
        {
            return res.status(400).json({ message: "La orden ya fue pagada" });
        }

        const orderItems = order.orderItems || order.OrderItems || [];
        const items = orderItems.map(item => ({
            title: item.name,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
            currency_id: 'ARS',
        }));

        const frontendUrl = FRONTEND_URL.trim();

        const preferenceData = {
            items,
            back_urls: {
                success: `${frontendUrl}/payment/success?orderId=${orderId}`,
                failure: `${frontendUrl}/payment/failure?orderId=${orderId}`,
                pending: `${frontendUrl}/payment/pending?orderId=${orderId}`,
            },
            external_reference: String(orderId),
        };

        if (MP_WEBHOOK_URL) 
        {
            preferenceData.notification_url = MP_WEBHOOK_URL.trim();
        }

        console.log("📤 Enviando payload a MP:", JSON.stringify(preferenceData, null, 2));

        const preference = new Preference(client);
        const result = await preference.create({ body: preferenceData });

        await order.update({ mpPreferenceId: result.id });

        return res.json({ 
            preferenceId: result.id, 
            initPoint: result.init_point, 
            sandboxInitPoint: result.sandbox_init_point 
        });

    } 
    catch (error) 
    {
        console.error('\n❌ createPreference error:', error.message || error);
        if (error.cause) console.error('Cause:', error.cause);
        if (error.response) console.error('Response Data:', error.response?.data || error.response);
        console.error('Stack:', error.stack);
        return res.status(500).json({ message: 'Error al crear preferencia de pago' });
    }
};


const triggerPaymentSuccessEmail = async (order) => {
    try {
        const orderUser = await User.findByPk(order.userId);
        if (orderUser) {
            const fullOrder = await Order.findByPk(order.id, { include: [{ model: OrderItem, as: 'orderItems' }] });
            sendPaymentSuccessEmail(orderUser.email, orderUser.username, fullOrder || order);
        }
    } catch (err) {
        console.error("Error al enviar email de confirmación de pago:", err.message || err);
    }
};


export const syncPendingOrderPayment = async (order) => 
{
    if (!order || order.status === 'paid' || order.status === 'cancelled' || order.status === 'expired' || order.status === 'refunded' || order.status === 'refunding') 
    {
        return order;
    }

    try 
    {
        let mpPaymentStatus = null;
        let fetchedPaymentId = order.mpPaymentId;

        if (fetchedPaymentId && client) 
        {
            try 
            {
                const payment = new Payment(client);
                const paymentData = await payment.get({ id: fetchedPaymentId });
                mpPaymentStatus = paymentData.status;
                fetchedPaymentId = String(paymentData.id);
            } 
            catch (err) 
            {
                console.warn(`[SyncPayment] Error al consultar MP por paymentId ${fetchedPaymentId}:`, err.message || err);
            }
        }

        // If paymentId was not saved or get() failed, search MP payments by external_reference (orderId)
        if (!mpPaymentStatus && client) 
        {
            try 
            {
                const payment = new Payment(client);
                const searchResult = await payment.search({
                    options: {
                        external_reference: String(order.id)
                    }
                });
                const results = searchResult?.results || searchResult?.body?.results || [];
                const approvedPayment = results.find(p => p.status === 'approved');
                if (approvedPayment) 
                {
                    mpPaymentStatus = 'approved';
                    fetchedPaymentId = String(approvedPayment.id);
                } 
                else if (results.length > 0) 
                {
                    const latest = results[0];
                    mpPaymentStatus = latest.status;
                    fetchedPaymentId = String(latest.id);
                }
            } 
            catch (searchErr) 
            {
                console.warn(`[SyncPayment] Error buscando pagos en MP para orden ${order.id}:`, searchErr.message || searchErr);
            }
        }

        if (mpPaymentStatus === 'approved') 
        {
            await sequelize.transaction(async (t) => {
                await order.update({
                    mpPaymentId: fetchedPaymentId ? String(fetchedPaymentId) : order.mpPaymentId,
                    mpStatus: 'approved',
                    status: 'paid',
                }, { transaction: t });

                const orderItems = order.orderItems || order.OrderItems || await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
                for (const item of orderItems) 
                {
                    const seatLabels = parseSeats(item.seats);
                    if (item.type === 'ticket' && seatLabels.length > 0) 
                    {
                        await Seat.update(
                            { status: 'Vendido' },
                            { 
                                where: { showingId: item.refId, label: seatLabels },
                                transaction: t 
                            }
                        );
                    }
                }
            });
            order.status = 'paid';
            order.mpStatus = 'approved';
            triggerPaymentSuccessEmail(order);
        }
    } 
    catch (error) 
    {
        console.error(`[SyncPayment] Error en sincronización de orden ${order.id}:`, error);
    }

    return order;
};


export const handleWebhook = async (req, res) => 
{
    try 
    {
        const type = req.body?.type || req.query?.topic || req.query?.type;
        const paymentId = req.body?.data?.id || req.query?.id || req.query?.['data.id'];

        if (type === 'payment' || req.body?.action?.startsWith('payment.')) 
        {
            if (!paymentId) 
            {
                return res.sendStatus(200);
            }

            if (!client) 
            {
                console.error("Webhook recibido pero Mercado Pago no está configurado");
                return res.status(503).json({ message: "Mercado Pago no está configurado" });
            }

            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            const orderId = paymentData.external_reference;
            const order = await Order.findByPk(orderId, { include: [{ model: OrderItem, as: 'orderItems' }] });

            if (order) 
            {
                const statusMap = {
                    approved: 'paid',
                    pending: 'pending',
                    in_process: 'pending',
                    rejected: 'failed',
                    cancelled: 'cancelled',
                    refunded: 'refunded',
                    charged_back: 'refunded',
                };

                const newStatus = statusMap[paymentData.status];

                if (newStatus) 
                {
                    await sequelize.transaction(async (t) => {
                        const freshOrder = await Order.findByPk(orderId, {
                            include: [{ model: OrderItem, as: 'orderItems' }],
                            transaction: t,
                            lock: t.LOCK.UPDATE
                        });

                        if (!freshOrder) return;

                        if (newStatus === 'refunded') 
                        {
                            await processOrderRefund(freshOrder, t);
                        } 
                        else if (newStatus !== freshOrder.status && freshOrder.status !== 'refunding' && freshOrder.status !== 'refunded')
                        {
                            await freshOrder.update({
                                mpPaymentId: String(paymentData.id),
                                mpStatus: paymentData.status,
                                status: newStatus,
                            }, { transaction: t });

                            let orderItems = freshOrder.orderItems || freshOrder.OrderItems;
                            if (!orderItems || orderItems.length === 0) {
                                orderItems = await OrderItem.findAll({ where: { orderId: freshOrder.id }, transaction: t });
                            }

                            if (newStatus === 'paid') 
                            {
                                for (const item of (orderItems || [])) 
                                {
                                    const seatLabels = parseSeats(item.seats);
                                    if (item.type === 'ticket' && seatLabels.length > 0) 
                                    {
                                        await Seat.update(
                                            { status: 'Vendido' },
                                            { 
                                                where: { showingId: item.refId, label: seatLabels },
                                                transaction: t 
                                            }
                                        );
                                    }
                                }
                            } 
                            else if (newStatus === 'failed' || newStatus === 'cancelled') 
                            {
                                for (const item of (orderItems || [])) 
                                {
                                    const seatLabels = parseSeats(item.seats);
                                    if (item.type === 'ticket' && seatLabels.length > 0) 
                                    {
                                        await Seat.update(
                                            { status: 'Libre' },
                                            { 
                                                where: { showingId: item.refId, label: seatLabels },
                                                transaction: t 
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    });

                    if (newStatus === 'paid' && order.status !== 'paid') 
                    {
                        triggerPaymentSuccessEmail(order);
                    }
                    else if (newStatus === 'refunded' && order.status !== 'refunded')
                    {
                        try 
                        {
                            const refundUser = await User.findByPk(order.userId);
                            if (refundUser) 
                            {
                                Promise.resolve(sendRefundEmail(refundUser.email, refundUser.username, order.id, order.total))
                                    .catch(err => console.error("Non-blocking webhook refund email error:", err));
                            }
                        } 
                        catch (emailErr) 
                        {
                            console.error("Error fetching user for webhook refund email:", emailErr);
                        }
                    }
                }
            }
        }

        return res.sendStatus(200);

    } 
    catch (error) 
    {
        console.error('webhook error:', error);
        return res.sendStatus(500);
    }
};


export const verifyPayment = async (req, res) => 
{
    try 
    {
        const { orderId, paymentId, status: bodyStatus, collection_status: collectionStatus } = req.body;
        const userId = req.user?.id;

        if (!orderId) 
        {
            return res.status(400).json({ message: "orderId es requerido" });
        }

        const order = await Order.findByPk(orderId, { include: [{ model: OrderItem, as: 'orderItems' }] });

        if (!order) 
        {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        if (String(order.userId) !== String(userId) && req.user?.role !== 'admin' && req.user?.role !== 'sysadmin') 
        {
            return res.status(403).json({ message: "No autorizado" });
        }

        if (order.status === 'paid' || order.status === 'refunding' || order.status === 'refunded') 
        {
            return res.json({ message: `La orden está en estado ${order.status}`, order });
        }

        if (paymentId) 
        {
            order.mpPaymentId = String(paymentId);
        }

        await syncPendingOrderPayment(order);

        const statusMap = {
            approved: 'paid',
            pending: 'pending',
            in_process: 'pending',
            rejected: 'failed',
            cancelled: 'cancelled',
        };
        const fallbackStatus = bodyStatus || collectionStatus;
        if (order.status !== 'paid' && fallbackStatus && statusMap[fallbackStatus] === 'paid') 
        {
            await sequelize.transaction(async (t) => {
                await order.update({
                    mpPaymentId: paymentId ? String(paymentId) : order.mpPaymentId,
                    mpStatus: fallbackStatus,
                    status: 'paid',
                }, { transaction: t });

                const orderItems = order.orderItems || order.OrderItems || [];
                for (const item of orderItems) 
                {
                    const seatLabels = parseSeats(item.seats);
                    if (item.type === 'ticket' && seatLabels.length > 0) 
                    {
                        await Seat.update(
                            { status: 'Vendido' },
                            { 
                                where: { showingId: item.refId, label: seatLabels },
                                transaction: t 
                            }
                        );
                    }
                }
            });
            order.status = 'paid';
            triggerPaymentSuccessEmail(order);
        }

        const updatedOrder = await Order.findByPk(orderId);
        return res.json({ message: "Verificación completada", order: updatedOrder });

    } 
    catch (error) 
    {
        console.error('verifyPayment error:', error);
        return res.status(500).json({ message: 'Error al verificar el pago' });
    }
};


export const refundPayment = async (req, res) => 
{
    try 
    {
        const { orderId } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        // Phase 1: Lock order and perform validations inside DB transaction
        let orderToRefund = null;

        const validationResult = await sequelize.transaction(async (t) => {
            const order = await Order.findByPk(orderId, { 
                include: [{ model: OrderItem, as: 'orderItems' }],
                transaction: t,
                lock: t.LOCK.UPDATE 
            });

            if (!order) 
            {
                return { errorStatus: 404, message: "Orden no encontrada" };
            }

            if (String(order.userId) !== String(userId) && userRole !== 'admin' && userRole !== 'sysadmin') 
            {
                return { errorStatus: 403, message: "No autorizado" };
            }

            if (order.status === 'refunded')
            {
                return { errorStatus: 400, message: "La orden ya ha sido reembolsada anteriormente" };
            }

            if (order.status !== 'paid' && order.status !== 'refunding') 
            {
                return { errorStatus: 400, message: "Solo se pueden reembolsar órdenes pagadas" };
            }

            // Showtime check: non-admin users cannot refund past or missing showtimes
            let orderItems = order.orderItems || order.OrderItems;
            if (!orderItems || orderItems.length === 0) {
                orderItems = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
            }

            if (userRole !== 'admin' && userRole !== 'sysadmin') 
            {
                for (const item of (orderItems || [])) 
                {
                    if (item.type === 'ticket') 
                    {
                        const show = await MovieShowing.findByPk(item.refId, { transaction: t });
                        if (show && show.showtime) 
                        {
                            const showDate = new Date(show.showtime);
                            const twoHoursInMs = 2 * 60 * 60 * 1000;
                            if (!isNaN(showDate.getTime()) && (showDate.getTime() - Date.now() <= twoHoursInMs)) 
                            {
                                return { 
                                    errorStatus: 400, 
                                    message: "No se pueden reembolsar entradas con menos de 2 horas de anticipación al inicio de la función" 
                                };
                            }
                        }
                    }
                }
            }

            // Temporarily set status to 'refunding' to prevent concurrent refund attempts
            await order.update({ status: 'refunding' }, { transaction: t });
            orderToRefund = order;
            return { valid: true };
        });

        if (validationResult.errorStatus) 
        {
            return res.status(validationResult.errorStatus).json({ message: validationResult.message });
        }

        // Phase 2: Call Mercado Pago API OUTSIDE of the DB transaction
        let mpRefundSuccess = false;
        let mpErrorMessage = null;

        let mpPaymentIdStr = String(orderToRefund.mpPaymentId || '').trim();

        // If mpPaymentId is missing but MP token is configured, try searching MP by external_reference (orderId)
        if ((!mpPaymentIdStr || mpPaymentIdStr === 'null' || mpPaymentIdStr === 'undefined') && MP_ACCESS_TOKEN && MP_ACCESS_TOKEN.trim() !== '') 
        {
            try {
                const searchRes = await fetch(
                    `https://api.mercadopago.com/v1/payments/search?external_reference=${orderToRefund.id}`,
                    { headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` } }
                );
                if (searchRes.ok) {
                    const searchData = await searchRes.json().catch(() => ({}));
                    const matchingPayment = searchData.results?.find(p => p.status === 'approved' || p.status === 'refunded' || p.status === 'in_process');
                    const foundId = matchingPayment?.id || searchData.results?.[0]?.id;
                    if (foundId) {
                        mpPaymentIdStr = String(foundId);
                        orderToRefund.mpPaymentId = mpPaymentIdStr;
                        await orderToRefund.update({ mpPaymentId: mpPaymentIdStr }).catch(() => {});
                    }
                }
            } catch (searchErr) {
                console.error('[Refund] Error buscando mpPaymentId en MP:', searchErr);
            }
        }

        const hasMpToken = MP_ACCESS_TOKEN && MP_ACCESS_TOKEN.trim() !== '';

        if (hasMpToken) 
        {
            if (!mpPaymentIdStr || mpPaymentIdStr === 'null' || mpPaymentIdStr === 'undefined') 
            {
                mpRefundSuccess = false;
                mpErrorMessage = "No se pudo encontrar el ID de pago en Mercado Pago para procesar el reembolso";
            } 
            else 
            {
                try 
                {
                    const refundResponse = await fetch(
                        `https://api.mercadopago.com/v1/payments/${mpPaymentIdStr}/refunds`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                                'X-Idempotency-Key': `refund-order-${orderId}`
                            },
                            body: JSON.stringify({}),
                        }
                    );

                    if (refundResponse.ok) 
                    {
                        mpRefundSuccess = true;
                    } 
                    else 
                    {
                        const errPayload = await refundResponse.json().catch(() => ({}));
                        console.error('MP refund error payload:', errPayload);

                        const errorStr = JSON.stringify(errPayload).toLowerCase();
                        // Handle idempotency / already refunded cases on MP gracefully
                        if ([400, 409, 422].includes(refundResponse.status) && (errorStr.includes('already_refunded') || errorStr.includes('already refunded') || errorStr.includes('2061') || errorStr.includes('not_refundable'))) 
                        {
                            console.warn(`[Refund] MP informó que la orden ${orderId} ya estaba reembolsada o procesada:`, errPayload);
                            mpRefundSuccess = true;
                        } 
                        else 
                        {
                            const causeMsg = Array.isArray(errPayload.cause) && errPayload.cause[0]?.description;
                            const rawErr = causeMsg || errPayload.message || errPayload.error;
                            mpErrorMessage = typeof rawErr === 'string' ? rawErr : (rawErr ? JSON.stringify(rawErr) : "Error en Mercado Pago al procesar el reembolso");
                        }
                    }
                } 
                catch (mpError) 
                {
                    console.error('MP refund request network error:', mpError);
                    mpErrorMessage = "Error de conexión con Mercado Pago";
                }
            }
        } 
        else 
        {
            // Dev/Test mode without MP_ACCESS_TOKEN configured
            mpRefundSuccess = true;
        }

        // If MP refund failed genuinely, revert order status back to 'paid' in DB
        if (!mpRefundSuccess) 
        {
            await sequelize.transaction(async (t) => {
                const order = await Order.findByPk(orderId, { transaction: t });
                if (order && order.status === 'refunding') {
                    await order.update({ status: 'paid' }, { transaction: t });
                }
            });
            return res.status(400).json({ message: mpErrorMessage || "Error al procesar el reembolso en Mercado Pago" });
        }

        // Phase 3: Finalize refund in local DB transaction
        await sequelize.transaction(async (t) => {
            await processOrderRefund(orderToRefund, t);
        });

        // Non-blocking email notification
        try 
        {
            const refundUser = await User.findByPk(orderToRefund.userId);
            if (refundUser) 
            {
                Promise.resolve(sendRefundEmail(refundUser.email, refundUser.username, orderToRefund.id, orderToRefund.total))
                    .catch(err => console.error("Non-blocking refund email error:", err));
            }
        } 
        catch (emailErr) 
        {
            console.error("Error fetching user for refund email:", emailErr);
        }

        const finalOrder = await Order.findByPk(orderId);
        return res.json({ message: "Reembolso procesado exitosamente", order: finalOrder });

    } 
    catch (error) 
    {
        console.error('refundPayment error:', error);

        if (orderToRefund && mpRefundSuccess) 
        {
            try 
            {
                await sequelize.transaction(async (t) => {
                    await processOrderRefund(orderToRefund, t);
                });
            } 
            catch (finalizeErr) 
            {
                console.error('[Refund] Error intentando finalizar el reembolso tras éxito en MP:', finalizeErr);
                await Order.update({ status: 'refunded', mpStatus: 'refunded' }, { where: { id: orderId } }).catch(() => {});
            }
        }
        else if (orderToRefund && !mpRefundSuccess) 
        {
            try 
            {
                await sequelize.transaction(async (t) => {
                    const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
                    if (order && order.status === 'refunding') {
                        await order.update({ status: 'paid' }, { transaction: t });
                    }
                });
            } 
            catch (revertErr) 
            {
                console.error('Error reverting refunding status on failure:', revertErr);
            }
        }

        return res.status(500).json({ message: 'Error al procesar el reembolso' });
    }
};


export const getPaymentStatus = async (req, res) => 
{
    try 
    {
        const { orderId } = req.params;
        const order = await Order.findByPk(orderId);

        if (!order) 
        {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        const requesterId = req.user?.id;
        const requesterRole = req.user?.role;
        if (!requesterId || (String(order.userId) !== String(requesterId) && requesterRole !== 'admin' && requesterRole !== 'sysadmin')) {
            return res.status(403).json({ message: "No tienes permiso para ver esta orden" });
        }

        return res.json({
            orderId: order.id,
            status: order.status,
            mpStatus: order.mpStatus,
            total: order.total,
        });

    } 
    catch (error) 
    {
        console.error('getPaymentStatus error:', error);
        return res.status(500).json({ message: 'Error al obtener estado del pago' });
    }
};

// v
