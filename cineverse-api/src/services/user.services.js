
import { User } from "../models/User.js" 


export const registerUser = async (req, res) =>
{
    const { name, email, password } = req.body



    const user = await User.findOne(
    {
        where:
        {
            email
        }
    })

    if (user)
    {
        return res.status(400).send({ message: "Usuario existente" })
    }



    // CIFRADO DE CONTRASEÑA
    const saltRounds = 10

    const salt = await bcrypt.genSalt(saltRounds)

    const hashedPassword = await bcrypt.hash(password, salt)



    const newUser = await User.create(
    {
        name,
        email,
        password: hashedPassword
    })



    res.json(newUser.id)

}


export const loginUser = async (req, res) =>
{
    const { email, password } = req.body



    const user = await User.findOne(
    {
        where:
        {
            email
        }
    })

    if (!user)
    {
        return res.status(401).send({ message: "Usuario no existente" })
    }



    const comparison = await bcrypt.compare(password, user.password)

    if (!comparison)
    {
        return res.status(401).send({ message: "Email y/o contraseña incorrecta" })
    }



    // GENERACIÓN DE TOKEN
    const secretKey = 'programacion3-2025'

    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' })


    
    return res.json(token)

}