import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Ticket = sequelize.define("Ticket", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  movieShowingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  movieShowingDate: {
    type: DataTypes.DATE, 
    allowNull: false
  },
  
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  seatNumber: {
    type: DataTypes.STRING, 
    allowNull: false
  },

  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
}, 

{
  tableName: "Tickets",
  timestamps: false
});
