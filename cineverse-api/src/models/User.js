
import { DataTypes } from "sequelize"
import { sequelize } from "../db.js"
// SE IMPORTA LA FUNCIÓN CREADA EN ESA RUTA, NO "SEQUELIZE" LITERAL


export const User = sequelize.define("user", 
{
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name:
    {
        type: DataTypes.STRING,
        allowNull: true
    },

    email:
    {
        toye: DataTypes.STRING,
        allowNull: false
    },

    password:
    {
        type: DataTypes.TEXT,
        allowNull: false
    }
},

{
    timestamps: false
}

)


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


    // HASHEANDO LA CONTRASEÑA (RE NEGRO DECIRLO ASÍ)
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
    // npm i jsonwebtoken
    
    const secretKey = 'altolaburonosmandamos-2025'

    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' })

    return res.json(token)
    
}