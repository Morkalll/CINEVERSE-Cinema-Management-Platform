
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


