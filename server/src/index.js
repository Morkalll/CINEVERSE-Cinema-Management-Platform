import express from 'express'
import cors from 'cors'
import { PORT, FRONTEND_URL } from './config.js'
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
import movieShowingsRoutes from "./routes/movieshowing.routes.js";
import screenRoutes from "./routes/screen.routes.js"
import seatRoutes from "./routes/seats.routes.js"
import userRoutes from "./routes/user.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import { cleanupExpiredOrders } from "./services/order.services.js";



const app = express();

async function main() 
{
  try 
  {

    // Disable FK checks so SQLite's alter-table (drop + recreate) strategy doesn't fail
    await sequelize.query("PRAGMA foreign_keys = OFF;");

    // Clean up orphaned _backup tables left by previous failed sync({ alter: true }) attempts
    const [backupTables] = await sequelize.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup';"
    );
    for (const { name } of backupTables) 
    {
      await sequelize.query(`DROP TABLE IF EXISTS \`${name}\`;`);
    }

    if (process.env.NODE_ENV === 'production') {
        await sequelize.sync();
    } else {
        await sequelize.sync({ alter: true });
    }

    // Re-enable FK enforcement for runtime
    await sequelize.query("PRAGMA foreign_keys = ON;");

    app.use(express.json({ limit: '10mb' }));
    app.use(cors({ origin: FRONTEND_URL, credentials: true }));

    app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

    app.use("/api/auth", authRoutes);
    app.use('/api', movieRoutes);
    app.use('/api', productsRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api", movieShowingsRoutes); 
    app.use("/api", screenRoutes); 
    app.use("/api", seatRoutes);
    app.use("/api", userRoutes);
    app.use("/api/payments", paymentRoutes);

    app.listen(PORT);
    console.log(`🚀 Server listening on port ${PORT}`);

    // Iniciar el temporizador de limpieza (cada 1 minuto)
    setInterval(cleanupExpiredOrders, 60 * 1000);

  } 
  
  catch (error) 
  {
    console.log(" There was an error on initialization", error);
    process.exit(1);
  }

}

main();