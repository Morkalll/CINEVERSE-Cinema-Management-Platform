
import { DataTypes } from "sequelize"
import { sequelize } from "../db.js" 
// SE IMPORTA LA FUNCIÓN CREADA EN ESA RUTA, NO "SEQUELIZE" LITERAL

export const Movie = sequelize.define("movie", {

    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name:
    {
        type: DataTypes.STRING,
        allowNull: false
    },

    director:
    {
        type: DataTypes.STRING,
        allowNull: false
    },

    rating:
    {
        type: DataTypes.INTEGER
    },

    duration:
    {
        type: DataTypes.INTEGER
    },

    summary:
    {
        type: DataTypes.TEXT
    },

    imageURL:
    {
        type: DataTypes.STRING
    },

    isAvailable:
    {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

})

