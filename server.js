require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const apiRoutes = require("./api/index");

const app = express();

/**
 * 🔴 IMPORTANTE PARA RAILWAY
 * Nunca usar true en trust proxy con rate-limit
 */
app.set("trust proxy", 1);

/* ================= DB ================= */

connectDB();

/* ================= MIDDLEWARES ================= */

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

/* ================= STATIC FILES ================= */

app.use("/images", express.static("public/images"));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));
app.use(express.static(path.join(__dirname, "public")));

/* ================= RATE LIMIT ================= */

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.",
});

app.use(limiter);

/* ================= API ROUTES ================= */

app.use("/api", apiRoutes);

/* ================= HEALTH CHECK ================= */

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

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`),
);
