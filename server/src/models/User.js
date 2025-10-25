
import { DataTypes } from "sequelize"
import { sequelize } from "../db.js"


export const User = sequelize.define("user",
{
  id: 
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  username: 
  {
    type: DataTypes.STRING,
    allowNull: false,
  },

  email: 
  {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: 
    {
      isEmail: true,
    },
  },

  password: 
  {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  role: 
  {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user",
  },

  movieTickets: 
  {
    type: DataTypes.INTEGER,
  }
},

{
  timestamps: false,
});

