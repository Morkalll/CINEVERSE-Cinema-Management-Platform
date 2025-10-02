
import { readFileSync } from "fs";
import { join } from "path";
import { sequelize } from "./db.js";

export async function loadSQL() 
{
  try 
  {
    const sql = readFileSync(join(process.cwd(), "movies.sql"), "utf-8"); // usar process.cwd() para evitar errores
    await sequelize.query(sql);
    console.log("Base de datos inicializada desde movies.sql");

  } catch (err) 
  {
    console.error("Error al cargar movies.sql:", err.message);
  }
}
