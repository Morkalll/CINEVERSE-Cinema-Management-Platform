
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => 
{
    const header = req.header("Authorization") || ""
    const token = header.split(" ")[1]

    if (!token)
    {
        return res.status(401).json({ message: "No posee autorización requerida" })
    }

    try
    {
        const payload = jwt.verify(token, 'programacion3-2025')
        console.log(payload)
        next()
    }

    catch (error)
    {
        return res.status(403).json({ message: "No posee permisos correctos" })
    }
}