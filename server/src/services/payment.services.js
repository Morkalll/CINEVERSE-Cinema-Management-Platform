
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MP_ACCESS_TOKEN, FRONTEND_URL, MP_WEBHOOK_URL } from '../config.js';
import Order from '../models/Order.js';
import { OrderItem } from '../models/OrderItem.js';
import { User } from '../models/User.js';
import { Seat } from '../models/Seats.js';
import { Products } from '../models/Products.js';
import { sendRefundEmail } from './email.services.js';


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


export const handleWebhook = async (req, res) => 
{
    try 
    {
        const { type, data } = req.body;

        if (type === 'payment') 
        {
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: data.id });

            const orderId = paymentData.external_reference;
            const order = await Order.findByPk(orderId);

            if (order) 
            {
                const statusMap = {
                    approved: 'paid',
                    pending: 'pending',
                    in_process: 'pending',
                    rejected: 'failed',
                    cancelled: 'cancelled',
                };

                await order.update({
                    mpPaymentId: String(paymentData.id),
                    mpStatus: paymentData.status,
                    status: statusMap[paymentData.status] || order.status,
                });
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

        if (order.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'sysadmin') 
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
                }

            } 
            catch (mpError) 
            {
                console.error('MP refund request error:', mpError);
            }
        }

        // Restore stock and release seats
        for (const item of order.orderItems) 
        {
            if (item.type === 'product') 
            {
                const product = await Products.findByPk(item.refId);
                if (product) 
                {
                    product.stock = (product.stock || 0) + item.quantity;
                    await product.save();
                }
            } 
            else if (item.type === 'ticket') 
            {
                if (item.seats && Array.isArray(item.seats) && item.seats.length > 0) 
                {
                    await Seat.update(
                        { reserved: false },
                        { where: { showingId: item.refId, label: item.seats } }
                    );
                }
            }
        }

        await order.update({ status: 'refunded', mpStatus: 'refunded' });

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
