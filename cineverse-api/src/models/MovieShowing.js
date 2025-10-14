
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

        screenName:
        {
            type: DataTypes.ENUM('Sala 1', 'Sala 2', 'Sala 3', 'Sala 4'),
            allowNull: false,
        },

        screenId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },

        ticketPrice:
        {
            type: DataTypes.FLOAT,
            allowNull: false,

        },


        format:
        {
            type: DataTypes.ENUM('2D', '3D', 'IMAX', '4D'),
            allowNull: false,
            defaultValue: '2D'
        }
    },
    {
        tableName: "MovieShowings",
        timestamps: false,
    });