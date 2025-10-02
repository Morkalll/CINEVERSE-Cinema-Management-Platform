
import express from "express";
import { PORT } from "./config.js";
import { sequelize } from "./db.js";
import "./models/Movie.js";
import "./models/User.js";
import movieRoutes from "./routes/movie.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { loadSQL } from "./loadSql.js";

const app = express();

async function main() 
{
  try 
  {
    // 1. 1. Se asegura que
    await sequelize.sync();

    // 2. Cargar SQL (siempre resetea y mete los datos del archivo)
    await loadSQL();

    // 3. Middlewares
    app.use(express.json());

    // 4. Rutas con prefijos
    app.use("/api/auth", authRoutes);
    app.use("/api", movieRoutes);

    // 5. Levantar servidor
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));

  } catch (error) 
  {
    console.log("There was an error on initialization", error);
  }
}

main();
