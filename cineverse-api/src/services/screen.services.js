import { Screen } from "../models/Screen.js";


export const findAllScreens = async (req, res) => {
    try {
        const screens = await Screen.findAll();
        return res.json(screens);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const findOneScreen = async (req, res) => {
    try {
        const { id } = req.params;
        const screen = await Screen.findOne({ where: { id } });

        if (!screen) {
            return res.status(404).json({ message: "Screen not found" });
        }

        return res.json(screen);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const createScreen = async (req, res) => {
    try {
        const { capacity } = req.body;

        if (!capacity) {
            return res.status(400).json({ message: "capacity is required" });
        }

        const newScreen = await Screen.create({
            capacity
        });

        return res.status(201).json(newScreen);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const updateScreen = async (req, res) => {
    try {
        const { id } = req.params;
        const { capacity } = req.body;

        const screenToUpdate = await Screen.findByPk(id);
        if (!screenToUpdate) {
            return res.status(404).json({ message: "Screen not found" });
        }

        await screenToUpdate.update({ capacity });
        await screenToUpdate.save();

        return res.json(screenToUpdate);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const deleteScreen = async (req, res) => {
    try {
        const { id } = req.params;
        const screenToDelete = await Screen.findByPk(id);

        if (!screenToDelete) {
            return res.status(404).json({ message: "Screen not found" });
        }

        await screenToDelete.destroy();
        return res.send(`Screen with id: ${id} deleted`);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error interno" });
    }
};
