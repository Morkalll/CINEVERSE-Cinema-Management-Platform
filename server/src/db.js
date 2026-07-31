import { Sequelize } from "sequelize";
import sqlite3 from "@libsql/sqlite3";
import { DB_PATH, TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } from "./config.js";

const isTurso = Boolean((process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.USE_TURSO === 'true') && TURSO_CONNECTION_URL && TURSO_AUTH_TOKEN);

let sequelize;

if (isTurso) {
  const tursoUrl = `${TURSO_CONNECTION_URL}?authToken=${TURSO_AUTH_TOKEN}`;

  const customSqlite3 = {
    ...sqlite3,
    Database: class extends sqlite3.Database {
      constructor(filename, mode, callback) {
        super(tursoUrl, mode, callback);
        this.uuid = "turso-conn-uuid";
      }

      all(...args) {
        const callback = args[args.length - 1];
        if (typeof callback === "function") {
          const rest = args.slice(0, -1);
          return super.all(...rest, (err, rows) => {
            if (err) return callback(err);
            const mutableRows = Array.isArray(rows)
              ? rows.map((r) => (r && typeof r === "object" ? { ...r } : r))
              : rows;
            callback(null, mutableRows);
          });
        }
        return super.all(...args);
      }

      get(...args) {
        const callback = args[args.length - 1];
        if (typeof callback === "function") {
          const rest = args.slice(0, -1);
          return super.get(...rest, (err, row) => {
            if (err) return callback(err);
            const mutableRow = row && typeof row === "object" ? { ...row } : row;
            callback(null, mutableRow);
          });
        }
        return super.get(...args);
      }
    },
  };

  sequelize = new Sequelize({
    dialect: "sqlite",
    dialectModule: customSqlite3,
    storage: ":memory:",
    logging: false,
  });

  // Override transaction for Turso to prevent @libsql/sqlite3 from closing connection streams on 'BEGIN TRANSACTION'
  sequelize.transaction = async function (options, autoCallback) {
    const callback = typeof options === 'function' ? options : autoCallback;
    const dummyTx = {
      id: 'dummy-tx',
      uuid: 'dummy-uuid-1234',
      commit: async () => {},
      rollback: async () => {},
      LOCK: { UPDATE: 'UPDATE' },
      finished: false,
    };
    if (typeof callback === 'function') {
      return await callback(dummyTx);
    }
    return dummyTx;
  };
} else {
  if (process.env.VERCEL) {
    console.warn("⚠️ Running on Vercel without Turso configuration. Using in-memory SQLite fallback.");
  }
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.VERCEL ? ":memory:" : DB_PATH,
    logging: false,
  });
}

export { sequelize };

// v
