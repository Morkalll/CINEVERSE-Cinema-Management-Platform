import { readFileSync } from "fs";
import { join } from "path";
import { sequelize } from "./db.js";

export async function loadSQL() {
  try {
    const sql = readFileSync(join("src", "movies.sql"), "utf-8");
    await sequelize.query(sql);
    console.log(" Base de datos inicializada desde movies.sql");
  } catch (err) {c
    console.error(" Error al cargar movies.sql:", err.message);
  }
}
