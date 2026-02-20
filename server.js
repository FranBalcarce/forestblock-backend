import "dotenv/config";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import apiRoutes from "./api/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * IMPORTANTE PARA RAILWAY
 */
app.set("trust proxy", 1);

/* ================= DB ================= */
connectDB();

/* ================= MIDDLEWARES ================= */

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://forestblock.app",
        "https://www.forestblock.app",
        "https://forestblock-app-frontend-production.up.railway.app",
      ];

      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // 🔥 temporalmente permitir todo para evitar bloqueo
      }
    },
    credentials: true,
  }),
);

app.use(helmet());
app.use(bodyParser.json());

/* ================= STATIC FILES ================= */
app.use("/images", express.static("public/images"));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));
app.use(express.static(path.join(__dirname, "public")));

/* ================= RATE LIMIT ================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

/* ================= API ROUTES ================= */
app.use("/api", apiRoutes);

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "forestblock-api" });
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
