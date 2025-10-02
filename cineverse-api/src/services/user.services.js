
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";


export const registerUser = async (req, res) => 
{

    try 
    {

        const { name, email, password, role } = req.body;

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
            name,
            email,
            password: hashedPassword,
            role: role || "user",
        });

        // opcional: no devolver el password
        return res.status(201).json({ id: newUser.id, email: newUser.email });
  
    } catch (error) 
    {
        console.error("Error registerUser:", error);
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

        // GENERACIÓN DE TOKEN con id y role
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, 
        {
            expiresIn: "1h",
        });

        return res.json({ token });

    } catch (error) 
    {
        console.error("Error loginUser:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};


