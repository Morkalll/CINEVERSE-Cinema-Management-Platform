
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MP_ACCESS_TOKEN, FRONTEND_URL, MP_WEBHOOK_URL } from '../config.js';
import Order from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { User } from '../models/User.js';
import { Seat } from '../models/Seats.js';
import { Products } from '../models/Products.js';
import { sendRefundEmail, sendPaymentSuccessEmail } from './email.services.js';
import { sequelize } from '../db.js';


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

        const order = await Order.findByPk(orderId, { include: [OrderItem] });

        if (!order) 
        {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        if (order.userId !== userId) 
        {
            return res.status(403).json({ message: "No autorizado" });
        }

        if (order.status === 'paid') 
        {
            return res.status(400).json({ message: "La orden ya fue pagada" });
        }

        const items = order.orderItems.map(item => ({
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
            const fullOrder = await Order.findByPk(order.id, { include: [OrderItem] });
            sendPaymentSuccessEmail(orderUser.email, orderUser.username, fullOrder || order);
        }
    } catch (err) {
        console.error("Error al enviar email de confirmación de pago:", err.message || err);
    }
};


export const syncPendingOrderPayment = async (order) => 
{
    if (!order || order.status === 'paid' || order.status === 'cancelled' || order.status === 'expired' || order.status === 'refunded') 
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

                const orderItems = order.orderItems || await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });
                for (const item of orderItems) 
                {
                    if (item.type === 'ticket' && item.seats && Array.isArray(item.seats) && item.seats.length > 0) 
                    {
                        await Seat.update(
                            { status: 'Vendido' },
                            { 
                                where: { showingId: item.refId, label: item.seats },
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
            const order = await Order.findByPk(orderId, { include: [OrderItem] });

            if (order && order.status !== 'paid' && paymentData.status === 'approved') 
            {
                const statusMap = {
                    approved: 'paid',
                    pending: 'pending',
                    in_process: 'pending',
                    rejected: 'failed',
                    cancelled: 'cancelled',
                };

                const newStatus = statusMap[paymentData.status] || order.status;

                await sequelize.transaction(async (t) => {
                    await order.update({
                        mpPaymentId: String(paymentData.id),
                        mpStatus: paymentData.status,
                        status: newStatus,
                    }, { transaction: t });

                    if (newStatus === 'paid') {
                        for (const item of order.orderItems) {
                            if (item.type === 'ticket' && item.seats && Array.isArray(item.seats) && item.seats.length > 0) {
                                await Seat.update(
                                    { status: 'Vendido' },
                                    { 
                                        where: { showingId: item.refId, label: item.seats },
                                        transaction: t 
                                    }
                                );
                            }
                        }
                    } else if (newStatus === 'failed' || newStatus === 'cancelled') {
                        for (const item of order.orderItems) {
                            if (item.type === 'ticket' && item.seats && Array.isArray(item.seats) && item.seats.length > 0) {
                                await Seat.update(
                                    { status: 'Libre' },
                                    { 
                                        where: { showingId: item.refId, label: item.seats },
                                        transaction: t 
                                    }
                                );
                            }
                        }
                    }
                });

                if (newStatus === 'paid') {
                    triggerPaymentSuccessEmail(order);
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

        const order = await Order.findByPk(orderId, { include: [OrderItem] });

        if (!order) 
        {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        if (order.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'sysadmin') 
        {
            return res.status(403).json({ message: "No autorizado" });
        }

        if (order.status === 'paid') 
        {
            return res.json({ message: "La orden ya fue pagada", order });
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

                for (const item of order.orderItems) 
                {
                    if (item.type === 'ticket' && item.seats && Array.isArray(item.seats) && item.seats.length > 0) 
                    {
                        await Seat.update(
                            { status: 'Vendido' },
                            { 
                                where: { showingId: item.refId, label: item.seats },
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

        const order = await Order.findByPk(orderId, { include: [OrderItem] });

        if (!order) 
        {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        if (order.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'sysadmin') 
        {
            return res.status(403).json({ message: "No autorizado" });
        }

        if (order.status !== 'paid') 
        {
            return res.status(400).json({ message: "Solo se pueden reembolsar órdenes pagadas" });
        }

        // Process Mercado Pago refund if payment exists
        if (order.mpPaymentId) 
        {
            try 
            {
                const refundResponse = await fetch(
                    `https://api.mercadopago.com/v1/payments/${order.mpPaymentId}/refunds`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                        },
                    }
                );

                if (!refundResponse.ok) 
                {
                    const err = await refundResponse.json();
                    console.error('MP refund error:', err);
                    throw new Error("Error en Mercado Pago al procesar el reembolso");
                }

            } 
            catch (mpError) 
            {
                console.error('MP refund request error:', mpError);
                throw mpError;
            }
        }

        // Restore stock and release seats
        await sequelize.transaction(async (t) => {
            for (const item of order.orderItems) 
            {
                if (item.type === 'product') 
                {
                    const product = await Products.findByPk(item.refId, { transaction: t, lock: t.LOCK.UPDATE });
                    if (product) 
                    {
                        product.stock = (product.stock || 0) + item.quantity;
                        await product.save({ transaction: t });
                    }
                } 
                else if (item.type === 'ticket') 
                {
                    if (item.seats && Array.isArray(item.seats) && item.seats.length > 0) 
                    {
                        await Seat.update(
                            { status: 'Libre' },
                            { 
                                where: { showingId: item.refId, label: item.seats },
                                transaction: t 
                            }
                        );
                    }
                }
            }

            await order.update({ status: 'refunded', mpStatus: 'refunded' }, { transaction: t });
        });

        // Send refund email
        const refundUser = await User.findByPk(order.userId);
        if (refundUser) 
        {
            sendRefundEmail(refundUser.email, refundUser.username, order.id, order.total);
        }

        return res.json({ message: "Reembolso procesado exitosamente", order });

    } 
    catch (error) 
    {
        console.error('refundPayment error:', error);
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
        if (!requesterId || (order.userId !== requesterId && requesterRole !== 'admin' && requesterRole !== 'sysadmin')) {
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
