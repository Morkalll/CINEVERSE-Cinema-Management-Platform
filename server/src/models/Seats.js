
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";


export const Seat = sequelize.define("Seat", 
{
    id: 
    {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    label: 
    {
        type: DataTypes.STRING,
        allowNull: false,
    },

    status: 
    {
        type: DataTypes.ENUM('Libre', 'Reservado', 'Vendido'),
        defaultValue: 'Libre',
        allowNull: false
    },

    showingId:
    {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
});
