import express from 'express';
import cors from 'cors';
import { PORT, FRONTEND_URL, TURSO_CONNECTION_URL } from './config.js';
import { sequelize } from './db.js';
import "./models/Movie.js";
import "./models/MovieShowing.js";
import "./models/User.js";
import "./models/Products.js";
import "./models/Screen.js";
import "./models/index.js";
import movieRoutes from "./routes/movie.routes.js";
import authRoutes from "./routes/auth.routes.js";
import productsRoutes from './routes/products.routes.js';
import orderRoutes from "./routes/order.routes.js";
import movieShowingsRoutes from "./routes/movieshowing.routes.js";
import screenRoutes from "./routes/screen.routes.js";
import seatRoutes from "./routes/seats.routes.js";
import userRoutes from "./routes/user.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { cleanupExpiredOrders } from "./services/order.services.js";

const app = express();

app.use(express.json({ limit: '10mb' }));

// CORS configuration allowing production frontend and localhost
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === FRONTEND_URL || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow configured origins in serverless
    }
  },
  credentials: true,
}));

let isInitialized = false;
let initPromise = null;

async function initDb() {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (process.env.NODE_ENV === 'production' || TURSO_CONNECTION_URL) {
        await sequelize.sync();
      } else {
        await sequelize.query("PRAGMA foreign_keys = OFF;");
        const [backupTables] = await sequelize.query(
          "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_backup';"
        );
        for (const { name } of backupTables) {
          await sequelize.query(`DROP TABLE IF EXISTS \`${name}\`;`);
        }
        await sequelize.sync({ alter: true });
        await sequelize.query("PRAGMA foreign_keys = ON;");
      }
      isInitialized = true;
      console.log('✅ Database synchronized');
    } catch (error) {
      console.error("❌ Error on DB initialization:", error);
    }
  })();

  return initPromise;
}

// Middleware to ensure DB connection before handling API requests
app.use(async (req, res, next) => {
  await initDb();
  next();
});

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

// Start server when run directly (local / non-serverless)
if (!process.env.VERCEL) {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
    setInterval(cleanupExpiredOrders, 60 * 1000);
  });
}

export default app;