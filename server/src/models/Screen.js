
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js"; 


export const Screen = sequelize.define("Screen", 
{
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    capacity: 
    {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},

{
    tableName: "Screen",
    timestamps: false
});
