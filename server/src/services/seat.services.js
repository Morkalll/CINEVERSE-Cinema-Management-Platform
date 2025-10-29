
import { Seat } from "../models/Seats.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";


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

        const seatsToReserve = await Seat.findAll(
        {
            where: 
            {
                showingId: showingId,
                label: seats
            }
        });

        if (seatsToReserve.length !== seats.length) 
        {
            return res.status(400).json(
            { 
                message: "Algunos asientos no existen" 
            });
        }

        const alreadyReserved = seatsToReserve.filter(seat => seat.reserved);
        if (alreadyReserved.length > 0) 
        {
            return res.status(409).json(
            { 
                message: "Algunos asientos ya están reservados",
                reservedSeats: alreadyReserved.map(s => s.label)
            });
        }

        await Seat.update(
            { reserved: true },
            { 
                where: 
                { 
                    showingId: showingId,
                    label: seats 
                } 
            }
        );


        res.json(
        { 
            message: "Asientos reservados exitosamente",
            reservedSeats: seats,
            
        });

    } 
    
    catch (error) 
    {
        console.error(error);
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
