import Order from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { sequelize } from "../db.js";
import { Op } from "sequelize";
import { MovieShowing } from "../models/MovieShowing.js";
import { Products } from "../models/Products.js";
import { Seat } from "../models/Seats.js";
import { User } from "../models/User.js";
import { Movie } from "../models/Movie.js";
import { sendOrderConfirmationEmail, sendOrderCancellationEmail } from './email.services.js';
import { syncPendingOrderPayment } from './payment.services.js';

let isCleanupRunning = false;

export const createOrder = async (req, res) => 
{
    const transaction = await sequelize.transaction();

    try 
    {
        const userId = req.user?.id;
        const { items } = req.body;

        if (!userId) 
        {    
            await transaction.rollback();
            return res.status(401).json({ message: "No autenticado" });
        }

        if (!Array.isArray(items) || items.length === 0)
        { 
            await transaction.rollback();
            return res.status(400).json({ message: "Carrito vacío" });
        }
        

        let total = 0;
        const processedItems = [];

        const createdOrder = await Order.create({ userId, total: 0 }, { transaction });


        for (const item of items) 
        {
            if (!item.type || !item.refId || !item.quantity) 
            {
                throw new Error("Item mal formado");
            }

            const refId = Number(item.refId);

            if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
                throw new Error(`Cantidad inválida para el item: ${item.quantity}`);
            }

            if (item.type === "ticket") 
            {
                const show = await MovieShowing.findByPk(refId, {
                    include: [{ model: Movie, as: 'movie' }],
                    transaction,
                });

                if (!show) 
                {        
                    throw new Error("Función no encontrada");          
                }    


                if (item.seats && Array.isArray(item.seats) && item.seats.length > 0) 
                {
                    const seatsToReserve = await Seat.findAll(
                    {
                        where: 
                        {
                            showingId: refId,
                            label: item.seats
                        },
                        transaction,
                    });

                    if (seatsToReserve.length !== item.seats.length) 
                    {
                        throw new Error("Algunos asientos no existen");
                    }

                    const alreadyReserved = seatsToReserve.filter(seat => seat.status !== 'Libre');
                    if (alreadyReserved.length > 0) 
                    {
                        throw new Error(`Algunos asientos para la función ${refId} ya están ocupados.`);
                    }

                    await Seat.update(
                        { status: 'Reservado' },
                        { 
                            where: 
                            { 
                                showingId: refId,
                                label: item.seats 
                            },
                            transaction
                        }
                    );
                }

                const price = parseFloat(show.ticketPrice);

                total += price * item.quantity;


                const orderItemData = {
                    orderId: createdOrder.id,
                    type: "ticket",
                    refId: refId,
                    name: show.movie ? show.movie.title : "Película",
                    price,
                    quantity: item.quantity,
                    seats: item.seats || null,
                };
                await OrderItem.create(orderItemData, { transaction });
                processedItems.push(orderItemData);

            } 
            
            else if (item.type === "product") 
            {
                const product = await Products.findByPk(refId, { transaction });

                if (!product) 
                {
                    throw new Error(`Producto ${refId} no encontrado`);
                }

                if (product.stock < item.quantity) 
                {
                    throw new Error(`Stock insuficiente para ${product.name}`);
                }


                const price = parseFloat(product.price);

                total += price * item.quantity;

                product.stock = product.stock - item.quantity;

                await product.save({ transaction });


                const orderItemData = {
                    orderId: createdOrder.id,
                    type: "product",
                    refId: item.refId,
                    name: product.name,
                    price,
                    quantity: item.quantity,
                };
                await OrderItem.create(orderItemData, { transaction });
                processedItems.push(orderItemData);

            } 
            
            else 
            {
                throw new Error("Tipo de item inválido");
            }

        }

        createdOrder.total = total;

        await createdOrder.save({ transaction });

        await transaction.commit();

        // Fire-and-forget email notification
        const orderUser = await User.findByPk(userId);
        if (orderUser) 
        {
            sendOrderConfirmationEmail(orderUser.email, orderUser.username, { id: createdOrder.id, total, items: processedItems }).catch(err => {
                console.error("Error sending order confirmation email:", err);
            });
        }

        return res.status(201).json({ orderId: createdOrder.id, total });

    } 
    
    catch (err)
    {
        await transaction.rollback();
        console.error("createOrder error:", err);
        return res.status(400).json({ message: err.message || "Error interno del servidor" });
    }

};


export const getUserOrders = async (req, res) => 
{
    try 
    {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "No autenticado" });

        const orders = await Order.findAll(
        {
            where: { userId },

            include: [
            {
                model: OrderItem,
                attributes: ["id", "type", "refId", "name", "price", "quantity", "seats"]
            }],

            order: [["createdAt", "DESC"]],
        });

        // Automatically sync any pending orders with MercadoPago
        for (const order of orders) 
        {
            if (order.status === 'created' || order.status === 'pending') 
            {
                await syncPendingOrderPayment(order);
            }
        }

        return res.json(orders);

    } 
    
    catch (err) 
    {
        console.error("getUserOrders error:", err);
        return res.status(500).json({ message: "Error interno" });
    }

};



export const getAllOrders = async (req, res) => 
{
    try 
    {
        const orders = await Order.findAll(
        {
            include: [OrderItem],
            order: [["createdAt", "DESC"]],
        });

        return res.json(orders);

    } 
    
    catch (err) 
    {
        console.error("getAllOrders error:", err);
        return res.status(500).json({ message: "Error interno" });
    }

};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id);
    
    if (!order) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }
    
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "La orden ya está cancelada" });
    }

    const isOwner = req.user.id === order.userId;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'sysadmin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "No tienes permiso para cancelar esta orden" });
    }

    if (!isAdmin && order.status === "paid") {
      return res.status(400).json({ message: "No puedes cancelar una orden pagada. Solicita un reembolso en su lugar." });
    }
    
    // Restore stock and release seats
    try {
        await sequelize.transaction(async (t) => {
            await processOrderCancellation(order, false, t);
        });
    } catch (txErr) {
        console.warn("Turso/SQLite transaction fallback during cancellation:", txErr.message);
        await processOrderCancellation(order, false, null);
    }
    
    return res.status(200).json({ message: "Orden cancelada exitosamente", order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al cancelar orden" });
  }
};

export const processOrderCancellation = async (order, isExpired = false, t = null) => {
    const orderItems = await OrderItem.findAll({ where: { orderId: order.id }, transaction: t });

    for (const item of orderItems) 
    {
        if (item.type === "product") 
        {
            const product = await Products.findByPk(item.refId, { transaction: t });
            if (product) 
            {
                product.stock = (product.stock || 0) + item.quantity;
                await product.save({ transaction: t });
            }
        } 
        else if (item.type === "ticket") 
        {
            let seatsList = item.seats;
            if (typeof seatsList === 'string') {
                try { seatsList = JSON.parse(seatsList); } catch { seatsList = []; }
            }
            if (seatsList && Array.isArray(seatsList) && seatsList.length > 0) 
            {
                await Seat.update(
                    { status: 'Libre' },
                    { where: { showingId: item.refId, label: seatsList }, transaction: t }
                );
            }
        }
    }

    order.status = isExpired ? "expired" : "cancelled";
    await order.save({ transaction: t });

    // Non-blocking email notification (prevents Vercel 10s timeout)
    setImmediate(async () => {
        try {
            const cancelUser = await User.findByPk(order.userId);
            if (cancelUser) {
                await sendOrderCancellationEmail(cancelUser.email, cancelUser.username, order.id, isExpired);
            }
        } catch (emailErr) {
            console.error("Error sending cancellation email:", emailErr);
        }
    });
};

export const cleanupExpiredOrders = async () => {
    if (isCleanupRunning) return;
    isCleanupRunning = true;
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const expiredOrders = await Order.findAll({
            where: {
                status: {
                    [Op.in]: ["created", "pending"]
                },
                createdAt: {
                    [Op.lt]: fiveMinutesAgo
                }
            }
        });

        for (const order of expiredOrders) {
            await sequelize.transaction(async (t) => {
                await processOrderCancellation(order, true, t);
            });
            console.log(`Orden expirada cancelada automáticamente: #${order.id}`);
        }
    } catch (err) {
        console.error("Error en cleanupExpiredOrders:", err);
    } finally {
        isCleanupRunning = false;
    }
};





export const deleteOrder = async (req, res) => 
{
    const transaction = await sequelize.transaction();

    try 
    {
        const userId = req.user?.id;
        const orderId = parseInt(req.params.id, 10);

        if (!userId) 
        {
            await transaction.rollback();
            return res.status(401).json({ message: "No autenticado" });
        }

        if (!orderId || Number.isNaN(orderId)) 
        {
            await transaction.rollback();
            return res.status(400).json({ message: "OrderID inválido" });
        }


        const order = await Order.findByPk(orderId, { transaction: transaction });


        if (!order) 
        {
            await transaction.rollback();
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        const requesterId = req.user.id;
        const requesterRole = req.user.role;
        if (order.userId !== requesterId && requesterRole !== 'admin' && requesterRole !== 'sysadmin') {
            await transaction.rollback();
            return res.status(403).json({ message: "No tienes permiso para eliminar esta orden" });
        }

        const orderItems = await OrderItem.findAll(
        {
            where: { orderId: order.id },
            transaction: transaction
        });

        for (const item of orderItems) 
        {
            console.log("🔄 Processing item:", item.id, "Type:", item.type);
            
          
            if (item.type === "product") 
            {
                try 
                {
                    const product = await Products.findByPk(item.refId, { transaction: transaction });

                    if (product) 
                    {
                        product.stock = (product.stock || 0) + item.quantity;
                        await product.save({ transaction: transaction });
                    }

                } 

                catch (e) 
                {
                    console.warn("No se pudo restaurar stock del producto", item.refId, e);
                    throw e;
                }

            } 
            
            else if (item.type === "ticket") 
            {
                try 
                {
                    // Capacity is not tracked directly in MovieShowing, it uses individual seats.
                    
                    if (item.seats && Array.isArray(item.seats) && item.seats.length > 0) 
                    {
                        // Release seats
                        await Seat.update(
                            { status: 'Libre' },
                            { 
                                where: 
                                { 
                                    showingId: item.refId,
                                    label: item.seats 
                                },
                                transaction: transaction
                            }
                        );
            
                    } 
                    
                } 
                
                catch (e) 
                {
                    console.error("No se pudo restaurar la capacidad de Show o liberar asientos", item.refId, e);
                    throw e;
                }
            }
        }

        await OrderItem.destroy({ where: { orderId: order.id }, transaction: transaction });
        await order.destroy({ transaction: transaction });

        await transaction.commit();

        // Fire-and-forget email notification
        const deleteUser = await User.findByPk(order.userId);
        if (deleteUser) 
        {
            sendOrderCancellationEmail(deleteUser.email, deleteUser.username, orderId).catch(err => {
                console.error("Error sending cancellation email:", err);
            });
        }

        return res.json({ success: true, message: "Orden cancelada", orderId: orderId });

    } 
    
    catch (err) 
    {
        await transaction.rollback();
        console.error("deleteOrder error:", err);
        return res.status(500).json({ message: err.message || "Error cancelando la orden" });
    }
};