
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";


export const Order = sequelize.define("order", 
{
    id: 
    { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    
    total: 
    { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },

    status: 
    { 
        type: DataTypes.STRING, 
        defaultValue: "created" 
    },

    createdAt: 
    { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },

    mpPreferenceId: 
    { 
        type: DataTypes.STRING, 
        allowNull: true 
    },

    mpPaymentId: 
    { 
        type: DataTypes.STRING, 
        allowNull: true 
    },

    mpStatus: 
    { 
        type: DataTypes.STRING, 
        allowNull: true 
    }
});



export default Order;
