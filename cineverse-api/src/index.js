
import express from 'express'
import cors from 'cors' // Esto permite el paso de solicitudes desde otros orígenes
import { PORT } from './config.js'
import { sequelize } from './db.js'
import "./models/Movie.js"
import "./models/MovieShowing.js"
import "./models/Ticket.js"
import "./models/Products.js"
import "./models/Screen.js"
import "./models/index.js"
import movieRoutes from "./routes/movie.routes.js"
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from './routes/products.routes.js';
import orderRoutes from "./routes/order.routes.js";
import movieShowingsRoutes from "./routes/movieShowing.routes.js";
import screenRoutes from "./routes/screen.routes.js"
import * as fs from "node:fs"



const app = express();

async function main() {
  try {
    if (!fs.existsSync("movies.db")) {
      await sequelize.sync({ alter: true });
    }
    

    // 2. Cargar SQL (Carga inicial o reseteo de datos, si es necesario)

    //await loadSQL();

    // 3. Middlewares

    app.use(express.json()); // Para que lea los cuerpos JSON
    app.use(cors()); // Middleware CORS

    // 4. Rutas con prefijos
    app.use("/api/auth", authRoutes);
    app.use('/api', movieRoutes);
    app.use('/api', productsRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api", movieShowingsRoutes); 
    app.use("/api", screenRoutes); 


    // 5. Levantar servidor
    app.listen(PORT);
    console.log(`🚀 Server listening on port ${PORT}`);

  } catch (error) {
    console.log(" There was an error on initialization", error);
  }
}

main();
