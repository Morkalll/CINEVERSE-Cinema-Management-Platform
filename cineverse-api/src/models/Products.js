
import { DataTypes } from "sequelize"
import { sequelize } from "../db.js" 



export const Products = sequelize.define("Products", 
{
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
    
    price:
    {
        type: DataTypes.FLOAT,
        allowNull: false
    },

    stock: 
    {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    image: 
    {
        type: DataTypes.STRING,
        allowNull: false
    },


    description: 
    {
        type: DataTypes.STRING,
        allowNull: false
    },

},
    
{
    tableName: "Products",
    timestamps: false
});