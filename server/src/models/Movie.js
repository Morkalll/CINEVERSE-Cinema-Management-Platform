
import { DataTypes } from "sequelize"
import { sequelize } from "../db.js" 


export const Movie = sequelize.define("Movie", 
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
    }
    
},

{
    tableName: "Movies",
    timestamps: false
});
