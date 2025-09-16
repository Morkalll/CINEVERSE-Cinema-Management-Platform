
import { DataTypes } from "sequelize"
import { sequelize } from "../db.js" 
// SE IMPORTA LA FUNCIÓN CREADA EN ESA RUTA, NO "SEQUELIZE" LITERAL


export const Movie = sequelize.define("movie", 
{
    id: 
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    title:
    {
        type: DataTypes.STRING,
        allowNull: false
    },
    
    genre:
    {
        type : DataTypes.STRING,
        allowNull : false
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

    synopsis:
    {
        type: DataTypes.TEXT
    },

    poster:
    {
        type: DataTypes.STRING
    },

    posterCarousel:
    {
        type: DataTypes.STRING
    },

    isAvailable:
    {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    releaseDate:
    {
        type : DataTypes.DATE
    }
        

})

