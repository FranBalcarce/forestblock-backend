import "dotenv/config";
import path from "path";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import apiRoutes from "./api/index.js";

const app = express();

/**
 * 🔴 IMPORTANTE PARA RAILWAY
 */
app.set("trust proxy", 1);

/* ================= DB ================= */
connectDB();

/* ================= MIDDLEWARES ================= */
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

/* ================= STATIC ================= */
app.use("/images", express.static("public/images"));
app.use("/fonts", express.static(path.join(process.cwd(), "public/fonts")));
app.use(express.static(path.join(process.cwd(), "public")));

/* ================= RATE LIMIT ================= */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/* ================= API ================= */
app.use("/api", apiRoutes);

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "forestblock-api",
    env: process.env.NODE_ENV || "development",
  });
});

/* ================= API 404 ================= */
app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found",
    path: req.originalUrl,
  });
});

/* ================= ERROR ================= */
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

/* ================= START ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
