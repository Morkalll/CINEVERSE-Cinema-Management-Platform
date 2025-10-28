
import { User } from "../models/User.js";
import bcrypt from "bcrypt";

export const registerSysAdmin = async (req, res) => 
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

        const newSysAdmin = await User.create(
        {
            username,
            email,
            password: hashedPassword,
            role: "sysadmin",
        });

        return res.status(201).json({ 
            id: newSysAdmin.id, 
            email: newSysAdmin.email,
            role: newSysAdmin.role 
        });
    } 
    catch (error) 
    {
        console.error("Error registerSysAdmin:", error);
        return res.status(500).json({ message: "Error interno" });
    }
};