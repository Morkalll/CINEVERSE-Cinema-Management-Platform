
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import Order from "./Order.js";


export const OrderItem = sequelize.define("orderItem", 
{
    id: 
    { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    
    type: 
    { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    
    refId: 
    { 
        type: DataTypes.INTEGER, 
        allowNull: false 
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

    quantity: 
    { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
});

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

export default OrderItem;
