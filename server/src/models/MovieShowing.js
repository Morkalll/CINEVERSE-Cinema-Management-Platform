
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";


export const MovieShowing = sequelize.define("MovieShowing",
{
    id:
    {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    movieId:
    {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    showtime:
    {
        type: DataTypes.DATE,
        allowNull: false
    },

    screenId: 
    {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    ticketPrice:
    {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

},

{
    tableName: "MovieShowings",
    timestamps: false,
});

