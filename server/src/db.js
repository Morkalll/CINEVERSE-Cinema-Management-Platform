import { Sequelize } from "sequelize";
import sqlite3 from "@libsql/sqlite3";
import { DB_PATH, TURSO_CONNECTION_URL, TURSO_AUTH_TOKEN } from "./config.js";

if (sqlite3.Database) {
  if (!sqlite3.Database.prototype.serialize) {
    sqlite3.Database.prototype.serialize = function (fn) {
      if (typeof fn === "function") fn();
    };
  }
  if (!sqlite3.Database.prototype.parallelize) {
    sqlite3.Database.prototype.parallelize = function (fn) {
      if (typeof fn === "function") fn();
    };
  }
}

const isTurso = Boolean((process.env.VERCEL || process.env.NODE_ENV === 'production' || process.env.USE_TURSO === 'true') && TURSO_CONNECTION_URL && TURSO_AUTH_TOKEN);

let sequelize;

try {
  if (isTurso) {
    const tursoUrl = `${TURSO_CONNECTION_URL}?authToken=${TURSO_AUTH_TOKEN}`;

    class TursoDatabase {
      constructor(filename, mode, callback) {
        this.tursoUrl = tursoUrl;
        this.mode = mode;
        this.uuid = "turso-conn-uuid";
        this.init(callback);
      }

      init(callback) {
        try {
          if (this._db) {
            try { this._db.close(); } catch (_) {}
          }
        } catch (_) {}
        this._db = new sqlite3.Database(this.tursoUrl, this.mode, callback);
        this._db.uuid = "turso-conn-uuid";
      }

      _normalize(method, result) {
        if (method === "all") {
          return Array.isArray(result) ? result.map((r) => (r && typeof r === "object" ? { ...r } : r)) : result;
        }
        if (method === "get") {
          return result && typeof result === "object" ? { ...result } : result;
        }
        return result;
      }

      _execWithRetry(method, args) {
        const callback = typeof args[args.length - 1] === "function" ? args[args.length - 1] : null;
        const restArgs = callback ? args.slice(0, -1) : args;

        const self = this;
        const handleResult = function (err, result) {
          const cbContext = this;
          const errMsg = err ? String(err.message || err) : "";
          if (err && (errMsg.includes("ClosedError") || errMsg.includes("Client was closed") || errMsg.includes("Stream is closed"))) {
            console.warn(`🔄 Auto-healing Turso connection after error: ${errMsg}. Re-opening stream...`);
            self.init();
            return self._db[method](...restArgs, function (retryErr, retryResult) {
              if (callback) {
                if (retryErr) return callback.call(this, retryErr);
                callback.call(this, null, self._normalize(method, retryResult));
              }
            });
          }
          if (callback) {
            if (err) return callback.call(cbContext, err);
            callback.call(cbContext, null, self._normalize(method, result));
          }
        };

        return this._db[method](...restArgs, handleResult);
      }

      all(...args) { return this._execWithRetry("all", args); }
      get(...args) { return this._execWithRetry("get", args); }
      run(...args) { return this._execWithRetry("run", args); }
      exec(...args) { return this._execWithRetry("exec", args); }
      serialize(fn) { if (typeof fn === "function") fn(); }
      parallelize(fn) { if (typeof fn === "function") fn(); }
      close(cb) { if (typeof cb === "function") cb(null); }
    };

    const customSqlite3 = {
      ...sqlite3,
      Database: TursoDatabase,
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
        name: 'dummy-tx',
        sequelize: sequelize,
        connection: {},
        commit: async () => {},
        rollback: async () => {},
        LOCK: { UPDATE: 'UPDATE', SHARE: 'SHARE' },
        finished: false,
        afterCommit: (fn) => typeof fn === 'function' && fn(),
      };
      if (typeof callback === 'function') {
        return await callback(dummyTx);
      }
      return dummyTx;
    };
  } else {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: process.env.VERCEL ? ":memory:" : DB_PATH,
      logging: false,
    });
  }
} catch (dbInitErr) {
  console.error("⚠️ Failed to initialize Turso custom dialect, falling back to standard SQLite:", dbInitErr.message);
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: process.env.VERCEL ? ":memory:" : DB_PATH,
    logging: false,
  });
}

export { sequelize };

// v
