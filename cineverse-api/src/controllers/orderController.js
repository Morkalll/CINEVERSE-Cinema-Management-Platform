
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import { sequelize } from "../db.js";
import { MovieShowing } from "../models/MovieShowing.js";
import { Products } from "../models/Products.js";

export const createOrder = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { items } = req.body;

        if (!userId) return res.status(401).json({ message: "No autenticado" });
        if (!Array.isArray(items) || items.length === 0)
            return res.status(400).json({ message: "Carrito vacío" });

        // Validar y calcular total
        let total = 0;

        // Usar transacción para seguridad (opcional pero recomendado)
        const createdOrder = await Order.create({ userId, total: 0 });
        try {
            for (const it of items) {
                if (!it.type || !it.refId || !it.quantity) {
                    throw new Error("Item mal formado");
                }

                if (it.type === "ticket") {
                    const show = await MovieShowing.findByPk(it.refId);
                    if (!show) throw new Error("Función no encontrada");
                    const price = parseFloat(show.ticketPrice);
                    total += price * it.quantity;

                    await OrderItem.create({
                        orderId: createdOrder.id,
                        type: "ticket",
                        refId: it.refId,
                        name: `${show.movieId} - ${show.screenName}`, // opcional, adaptar
                        price,
                        quantity: it.quantity,
                    });

                } else if (it.type === "product") {
                    const product = await Products.findByPk(it.refId);
                    if (!product) throw new Error(`Producto ${it.refId} no encontrado`);
                    if (product.stock < it.quantity) throw new Error(`Stock insuficiente para ${product.name}`);
                    const price = parseFloat(product.price);
                    total += price * it.quantity;

                    // disminuir stock
                    product.stock = product.stock - it.quantity;
                    await product.save();

                    await OrderItem.create({
                        orderId: createdOrder.id,
                        type: "product",
                        refId: it.refId,
                        name: product.name,
                        price,
                        quantity: it.quantity,
                    });
                } else {
                    throw new Error("Tipo de item inválido");
                }
            }

            // actualizar total de la orden
            createdOrder.total = total;
            await createdOrder.save();

            return res.status(201).json({ orderId: createdOrder.id, total });
        } catch (errInner) {
            // rollback manual si algo falló: eliminar la orden creada y cualquiera OrderItem asociado
            await OrderItem.destroy({ where: { orderId: createdOrder.id } }).catch(() => { });
            await createdOrder.destroy().catch(() => { });
            return res.status(400).json({ message: errInner.message || "Error creando pedido" });
        }

    } catch (err) {
        console.error("createOrder error:", err);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: "No autenticado" });

        const orders = await Order.findAll({
            where: { userId },
            include: [OrderItem],
            order: [["createdAt", "DESC"]],
        });

        return res.json(orders);
    } catch (err) {
        console.error("getUserOrders error:", err);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const deleteOrder = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user?.id;
        const orderId = parseInt(req.params.id, 10);

        if (!userId) {
            await t.rollback();
            return res.status(401).json({ message: "No autenticado" });
        }
        if (!orderId || Number.isNaN(orderId)) {
            await t.rollback();
            return res.status(400).json({ message: "Order id inválido" });
        }

        const order = await Order.findByPk(orderId, { include: [OrderItem], transaction: t });
        if (!order) {
            await t.rollback();
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        if (order.userId !== userId) {
            await t.rollback();
            return res.status(403).json({ message: "No autorizado para cancelar esta orden" });
        }

        // Restaurar stock / capacity según los items
        for (const it of order.OrderItems || []) {
            if (it.type === "product") {
                try {
                    const product = await Products.findByPk(it.refId, { transaction: t });
                    if (product) {
                        product.stock = (product.stock || 0) + it.quantity;
                        await product.save({ transaction: t });
                    }
                } catch (e) {
                    console.warn("No se pudo restaurar stock del producto", it.refId, e);
                }
            } else if (it.type === "ticket") {
                try {
                    const show = await MovieShowing.findByPk(it.refId, { transaction: t });
                    if (show && typeof show.capacity !== "undefined") {
                        show.capacity = (show.capacity || 0) + it.quantity;
                        await show.save({ transaction: t });
                    }
                } catch (e) {
                    console.warn("No se pudo restaurar capacity de show", it.refId, e);
                }
            }
        }

        // Borrar orderItems y la order
        await OrderItem.destroy({ where: { orderId: order.id }, transaction: t });
        await order.destroy({ transaction: t });

        await t.commit();
        return res.json({ success: true, message: "Orden cancelada", orderId: orderId });
    } catch (err) {
        console.error("deleteOrder error:", err);
        try { await t.rollback(); } catch (e) { /* ignore */ }
        return res.status(500).json({ message: err.message || "Error cancelando la orden" });
    }
};