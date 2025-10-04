
import express from 'express'
import cors from 'cors' // Esto permite el paso de solicitudes desde otros orígenes
import { PORT } from './config.js'
import { sequelize } from './db.js'
import "./models/Movie.js"
import movieRoutes from "./routes/movie.routes.js" 
import authRoutes from "./routes/auth.routes.js";
import { loadSQL } from './loadSql.js'; // Importación para cargar los datos

const app = express();

async function main() {
  try {
    // 1. Sincronización de la base de datos (con alter: true para actualizar si hay cambios en modelos)
    await sequelize.sync({ alter: true }); 
    
    // 2. Cargar SQL (Carga inicial o reseteo de datos, si es necesario)
    
    //await loadSQL();

    // 3. Middlewares

    app.use(express.json()); // Para que lea los cuerpos JSON
    app.use(cors()); // Middleware CORS

    // 4. Rutas con prefijos
    app.use("/api/auth", authRoutes);
    app.use('/api', movieRoutes);

    // 5. Levantar servidor
    app.listen(PORT);
    console.log(`🚀 Server listening on port ${PORT}`);

  } catch (error) 
  {
    console.log(" There was an error on initialization", error);
  }
}

main();
