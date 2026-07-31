
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { OrderItem } from "../models/OrderItem.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { sendWelcomeEmail, sendLoginAlertEmail, sendProfileUpdatedEmail, sendPasswordRecoveryEmail } from './email.services.js';



export const findAllUsers = async (req, res) => 
{
    try 
    {
        const users = await User.findAll(
        {
            attributes: { exclude: ['password'] } 
        });

        return res.status(200).json(users);
    } 
    catch (error) 
    {
        console.error("Error findAllUsers:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const deleteUser = async (req, res) => 
{
    try 
    {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) 
        {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (user.id === req.user.id) 
        {
            return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
        }

        const userOrders = await Order.findAll({ where: { userId: user.id } });
        for (const order of userOrders) {
            await OrderItem.destroy({ where: { orderId: order.id } });
            await order.destroy();
        }

        await user.destroy();

        return res.status(200).json({ message: "Usuario eliminado correctamente" });
    } 
    catch (error) 
    {
        console.error("Error deleteUser:", error);
        return res.status(500).json({ message: error.message || "Error al eliminar usuario" });
    }
};


export const updateUser = async (req, res) => 
{
    try 
    {
        const id = req.params.id;
        const { username, email, role } = req.body;

        if (!id) 
        {
            return res.status(400).json({ message: "ID de usuario es requerido" });
        }

        const user = await User.findByPk(id);

        if (!user) 
        {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }


        if (email && email !== user.email) 
        {
            const existingUser = await User.findOne({ where: { email } });
            
            if (existingUser) 
            {
                return res.status(400).json({ message: "El email ya está en uso" });
            }
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;

        await user.save();

        // Fire-and-forget email notification
        sendProfileUpdatedEmail(user.email, user.username);

        return res.status(200).json({
            message: "Usuario actualizado correctamente",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } 
    catch (error) 
    {
        console.error("Error updateUser:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};

export const registerUser = async (req, res) =>
{
    try 
    {
        const { username, email, password } = req.body;

        if (!email || !password) 
        {
            return res.status(400).json({ message: "Email y contraseña son requeridos" });
        }


        const user = await User.findOne({ where: { email } });

        if (user) 
        {
            return res.status(400).send({ message: "Usuario existente" });
        }


        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = await User.create(
        {
            username,
            email,
            password: hashedPassword,
            role: "user",
        });

        // Fire-and-forget email notification
        sendWelcomeEmail(newUser.email, newUser.username);

        return res.status(201).json({ id: newUser.id, email: newUser.email });

    } 
    
    catch (error) 
    {
        console.error("Error registerUser", error);
        return res.status(500).json({ message: "Error interno" });
    }
};


export const loginUser = async (req, res) => 
{
    try
    {
        const { email, password } = req.body;

        if (!email || !password) 
        {
            return res.status(400).json({ message: "Email y contraseña son requeridos" });
        }


        const user = await User.findOne({ where: { email } });

        if (!user) 
        {
            return res.status(401).send({ message: "Usuario no existente" });
        }


        const comparison = await bcrypt.compare(password, user.password);

        if (!comparison) 
        {
            return res.status(401).send({ message: "Email y/o contraseña incorrecta" });
        }


        const token = jwt.sign({ id: user.id, email: user.email, username: user.username, role: user.role }, JWT_SECRET,
        {
            expiresIn: "1h",
        });

        // Fire-and-forget email notification
        sendLoginAlertEmail(user.email, user.username);


        return res.json(
        {   token,
            user: 
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });

    }

    catch (error) 
    {
        console.error("Error loginUser:", error);
        return res.status(500).json({ message: "Error interno" });
    }

};


export const getUser = async (req, res) => 
{
    try 
    {
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

        res.json(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        });
    } 
    catch (error) 
    {
        console.error("Error getUser:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email es requerido" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Devolvemos 200 igual para no revelar qué emails existen
            return res.status(200).json({ message: "Si el correo esta registrado, enviaremos un enlace de recuperación." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "15m" });
        await sendPasswordRecoveryEmail(user.email, user.username, token);

        return res.status(200).json({ message: "Si el correo esta registrado, enviaremos un enlace de recuperación." });
    } catch (error) {
        console.error("Error forgotPassword:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "Nueva contraseña es requerida" });
        }

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "El enlace es inválido o ha expirado" });
        }

        const user = await User.findByPk(payload.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        console.error("Error resetPassword:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};
