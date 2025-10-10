
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import { MovieShowing } from "../models/MovieShowing.js";
import { Products } from "../models/Products.js";

export const createOrder = async (req, res) => {
    try {
        // req.user es el payload del token (verifyToken)
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
