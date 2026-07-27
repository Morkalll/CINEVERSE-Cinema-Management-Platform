import { Sequelize } from "sequelize";
import sqlite3 from "@libsql/sqlite3";
import { DB_PATH, TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } from "./config.js";

const isTurso = Boolean(TURSO_CONNECTION_URL && TURSO_AUTH_TOKEN);

let sequelize;

if (isTurso) {
  const tursoUrl = `${TURSO_CONNECTION_URL}?authToken=${TURSO_AUTH_TOKEN}`;

  const customSqlite3 = {
    ...sqlite3,
    Database: class extends sqlite3.Database {
      constructor(filename, mode, callback) {
        super(tursoUrl, mode, callback);
      }
    },
  };

  sequelize = new Sequelize({
    dialect: "sqlite",
    dialectModule: customSqlite3,
    storage: ":memory:",
    logging: false,
  });
} else {
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: DB_PATH,
    logging: false,
  });
}

export { sequelize };
