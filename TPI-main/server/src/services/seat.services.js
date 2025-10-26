
import { Seat } from "../models/Seats";


export const getSeats = (async (req, res) => 
{
    try
    {
        const { id } = req.params;
        const seats = await Seat.findAll({where: { showingId: id} });
        res.json(seats);

    }
    
    catch(error)
    {
        console.error(error);
        res.status(500).json({message: "Error al obtener asientos"});
    }
});
