
import { Sequelize } from "sequelize";
import { DB_PATH } from "./config.js";

export const sequelize = new Sequelize(
{
  dialect: "sqlite",
  storage: DB_PATH,
});


