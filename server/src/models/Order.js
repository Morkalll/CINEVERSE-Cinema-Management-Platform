
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { User } from "./User.js";


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
        type: DataTypes.FLOAT, 
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

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

export default Order;
