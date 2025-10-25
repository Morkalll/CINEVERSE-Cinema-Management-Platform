
import { User } from "../models/User.js";
import bcrypt from "bcrypt";


export const registerAdmin = async (req, res) => 
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
            role: "admin",
        });

        return res.status(201).json({ id: newUser.id, email: newUser.email });

    } 
    
    catch (error) 
    {
        console.error("Error registerUser:", error);
        return res.status(500).json({ message: "Error interno" });
    }

};

