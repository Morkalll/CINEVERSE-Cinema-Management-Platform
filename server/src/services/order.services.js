
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import { sequelize } from "../db.js";
import { MovieShowing } from "../models/MovieShowing.js";
import { Products } from "../models/Products.js";


export const createOrder = async (req, res) => 
{
    try 
    {
        const userId = req.user?.id;
        const { items } = req.body;

        if (!userId) 
        {    
            return res.status(401).json({ message: "No autenticado" });
        }

        if (!Array.isArray(items) || items.length === 0)
        { 
            return res.status(400).json({ message: "Carrito vacío" });
        }
        

        let total = 0;

        const createdOrder = await Order.create({ userId, total: 0 });


        try 
        {
            for (const item of items) 
            {
                if (!item.type || !item.refId || !item.quantity) 
                {
                    throw new Error("Item mal formado");
                }

                if (item.type === "ticket") 
                {
                    const show = await MovieShowing.findByPk(item.refId);

                    if (!show) 
                    {        
                        throw new Error("Función no encontrada");          
                    }    


                    const price = parseFloat(show.ticketPrice);

                    total += price * item.quantity;


                    await OrderItem.create(
                    {
                        orderId: createdOrder.id,
                        type: "ticket",
                        refId: item.refId,
                        name: `${show.movieTitle} - ${show.screenId}`,
                        price,
                        quantity: item.quantity,
                    });

                } 
                
                else if (item.type === "product") 
                {
                    const product = await Products.findByPk(item.refId);

                    if (!product) 
                    {
                        throw new Error(`Producto ${item.refId} no encontrado`);
                    }

                    if (product.stock < item.quantity) 
                    {
                        throw new Error(`Stock insuficiente para ${product.name}`);
                    }


                    const price = parseFloat(product.price);

                    total += price * item.quantity;

                    product.stock = product.stock - item.quantity;

                    await product.save();


                    await OrderItem.create(
                    {
                        orderId: createdOrder.id,
                        type: "product",
                        refId: item.refId,
                        name: product.name,
                        price,
                        quantity: item.quantity,
                    });

                } 
                
                else 
                {
                    throw new Error("Tipo de item inválido");
                }

            }

            createdOrder.total = total;

            await createdOrder.save();

            return res.status(201).json({ orderId: createdOrder.id, total });

        } 
        
        catch (transactionError) 
        {
            await OrderItem.destroy({ where: { orderId: createdOrder.id } }).catch(() => { });
            await createdOrder.destroy().catch(() => { });
            return res.status(400).json({ message: transactionError.message || "Error creando pedido" });
        }

    } 
    
    catch (err)
    {
        console.error("createOrder error:", err);
        return res.status(500).json({ message: "Error interno del servidor" });
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
            include: [OrderItem],
            order: [["createdAt", "DESC"]],
        });

        return res.json(orders);

    } 
    
    catch (err) 
    {
        console.error("getUserOrders error:", err);
        return res.status(500).json({ message: "Error interno" });
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


        const order = await Order.findByPk(orderId, { include: [OrderItem], transaction: transaction });


        if (!order) 
        {
            await transaction.rollback();
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        if (order.userId !== userId) 
        {
            await transaction.rollback();
            return res.status(403).json({ message: "No autorizado para cancelar esta orden" });
        }


        for (const item of order.OrderItems || []) 
        {
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
                }

            } 
            
            else if (item.type === "ticket") 
            {
                try 
                {
                    const show = await MovieShowing.findByPk(item.refId, { transaction: transaction });

                    if (show && typeof show.capacity !== "undefined") 
                    {
                        show.capacity = (show.capacity || 0) + item.quantity;
                        await show.save({ transaction: transaction });
                    }
                    
                } 
                
                catch (e) 
                {
                    console.warn("No se pudo restaurar la capacidad de Show", item.refId, e);
                }
            }
        }

        await OrderItem.destroy({ where: { orderId: order.id }, transaction: transaction });
        await order.destroy({ transaction: transaction });

        await transaction.commit();
        return res.json({ success: true, message: "Orden cancelada", orderId: orderId });

    } 
    
    catch (err) 
    {
        console.error("deleteOrder error:", err);
        return res.status(500).json({ message: err.message || "Error cancelando la orden" });
    }
};