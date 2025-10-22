import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Seat = sequelize.define("Seat", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false, // Ej: "A1", "B3", etc.
    },
    reserved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
});
