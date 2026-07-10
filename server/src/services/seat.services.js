
import { Seat } from "../models/Seats.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import { sequelize } from "../db.js";


export const getSeats = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const seats = await Seat.findAll(
        { 
            where: { showingId: id } 
        });

        res.json(seats);
    } 
    
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: "Error al obtener asientos" });
    }
};


export const getOccupiedSeats = async (req, res) => 
{
    try 
    {
        const { showingId } = req.query;
        
        if (!showingId) 
        {
            return res.status(400).json({ message: "showingId es requerido" });
        }

        const seats = await Seat.findAll(
        {
            where: { 
                showingId: showingId,
                reserved: true 
            },
            attributes: ['label']
        });

        const occupiedSeats = seats.map(seat => seat.label);
        
        res.json({ occupiedSeats });

    } 
    
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: "Error al obtener asientos ocupados" });
    }
};


export const reserveSeats = async (req, res) => 
{
    try 
    {
        const { userId, showingId, seats } = req.body;
        console.log(userId, showingId, seats)

        if (!userId || !showingId || !seats || seats.length === 0) 
        {
            return res.status(400).json(
            { 
                message: "userId, showingId y seats son requeridos" 
            });
        }

        await sequelize.transaction(async (t) => {
            const seatsToReserve = await Seat.findAll({
                where: { showingId, label: seats },
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            if (seatsToReserve.length !== seats.length) {
                throw new Error("Algunos asientos no existen");
            }

            const alreadyReserved = seatsToReserve.filter(seat => seat.reserved);
            if (alreadyReserved.length > 0) {
                throw new Error("Algunos asientos ya fueron reservados por otro usuario");
            }

            await Seat.update(
                { reserved: true },
                { 
                    where: { showingId, label: seats },
                    transaction: t
                }
            );
        });

        res.json({ 
            message: "Asientos reservados exitosamente",
            reservedSeats: seats,
        });

    } 
    catch (error) 
    {
        console.error(error);
        if (error.message === "Algunos asientos ya fueron reservados por otro usuario" || error.message === "Algunos asientos no existen") {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: "Error al reservar asientos" });
    }
};


export const releaseSeats = async (req, res) => 
{
    try 
    {
        const { showingId, seats } = req.body;

        if (!showingId || !seats || seats.length === 0) 
        {
            return res.status(400).json(
            { 
                message: "showingId y seats son requeridos" 
            });
        }

        // Verify the requesting user owns these seat reservations
        const requesterId = req.user?.id;
        const requesterRole = req.user?.role;
        
        if (!requesterId) {
            return res.status(401).json({ message: "No autenticado" });
        }
        const seatsToRelease = await Seat.findAll({
            where: {
                showingId: showingId,
                label: seats,
                reserved: true
            }
        });

        if (seatsToRelease.length === 0) {
            return res.status(404).json({ message: "No se encontraron asientos reservados" });
        }

        // Check if any of these seats belong to another user's order
        if (requesterRole !== 'admin' && requesterRole !== 'sysadmin') {
            const seatLabels = seatsToRelease.map(s => s.label);
            const otherUserOrders = await OrderItem.findAll({
                where: {
                    type: 'ticket',
                    refId: showingId,
                },
            });
            
            for (const orderItem of otherUserOrders) {
                if (orderItem.seats && Array.isArray(orderItem.seats)) {
                    const overlapping = orderItem.seats.filter(s => seatLabels.includes(s));
                    if (overlapping.length > 0) {
                        const order = await Order.findByPk(orderItem.orderId);
                        if (order && order.userId !== requesterId) {
                            return res.status(403).json({ message: "No tienes permiso para liberar estos asientos" });
                        }
                    }
                }
            }
        }

        await Seat.update(
            { reserved: false },
            { 
                where: { 
                    showingId: showingId,
                    label: seats 
                } 
            }
        );

        res.json(
        { 
            message: "Asientos liberados exitosamente",
            releasedSeats: seats
        });

    } 
    
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: "Error al liberar asientos" });
    }
};
