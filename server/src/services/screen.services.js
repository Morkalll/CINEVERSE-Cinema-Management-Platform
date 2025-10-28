
import { Screen } from "../models/Screen.js";
import { MovieShowing } from "../models/MovieShowing.js";
import { Seat } from "../models/Seats.js";
import { sequelize } from "../db.js";

export const findAllScreens = async (req, res) => 
{
    try 
    {
        const screens = await Screen.findAll();
        return res.json(screens);

    } 

    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const findOneScreen = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const screen = await Screen.findOne({ where: { id } });

        if (!screen) 
        {
            return res.status(404).json({ message: "Sala no encontrada" });
        }

        return res.json(screen);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const createScreen = async (req, res) => 
{
    try 
    {
        const { capacity } = req.body;

        if (!capacity) 
        {
            return res.status(400).json({ message: "La capacidad es requerida" });
        }

        const newScreen = await Screen.create(
        {
            capacity
        });

        return res.status(201).json(newScreen);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const updateScreen = async (req, res) => 
{
    try 
    {
        const { id } = req.params;
        const { capacity } = req.body;

        const screenToUpdate = await Screen.findByPk(id);

        if (!screenToUpdate) 
        {
            return res.status(404).json({ message: "Sala no encontrada" });
        }

        await screenToUpdate.update({ capacity });
        await screenToUpdate.save();

        return res.json(screenToUpdate);

    } 
    
    catch (error) 
    {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const deleteScreen = async (req, res) => 
{
    const transaction = await sequelize.transaction();
    
    try 
    {
        const { id } = req.params;
        const screenToDelete = await Screen.findByPk(id, { transaction });

        if (!screenToDelete) 
        {
            await transaction.rollback();
            return res.status(404).json({ message: "Sala no encontrada" });
        }

        // Find all showings for this screen
        const showings = await MovieShowing.findAll({ 
            where: { screenId: id },
            transaction 
        });

        // Delete seats for each showing
        for (const showing of showings) {
            await Seat.destroy({ 
                where: { showingId: showing.id },
                transaction 
            });
        }

        // Delete all showings for this screen
        await MovieShowing.destroy({ 
            where: { screenId: id },
            transaction 
        });

        // Finally delete the screen
        await screenToDelete.destroy({ transaction });
        
        await transaction.commit();
        return res.status(200).json({ message: `Sala con id: ${id} eliminada correctamente` });

    } 
    catch (error) 
    {
        await transaction.rollback();
        console.error("Error deleting screen:", error);
        return res.status(500).json({ message: error.message || "Error interno" });
    }
};

