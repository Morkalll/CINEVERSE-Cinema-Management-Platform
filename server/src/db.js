import { Sequelize } from "sequelize";
import sqlite3 from "sqlite3";
import { DB_PATH } from "./config.js";

const sequelize = new Sequelize({
  dialect: "sqlite",
  dialectModule: sqlite3,
  storage: DB_PATH,
  logging: false,
});

export { sequelize };
