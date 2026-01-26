import dotenv from "dotenv";
dotenv.config();

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

app.set("trust proxy", 1);

/* DB */
connectDB();

/* Middlewares */
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

/* Static */
app.use("/images", express.static("public/images"));
app.use("/fonts", express.static(path.join(__dirname, "public/fonts")));
app.use(express.static(path.join(__dirname, "public")));

/* Rate limit */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);

/* API */
app.use("/api", apiRoutes);

/* Health */
app.get("/", (_, res) => {
  res.json({
    status: "ok",
    service: "forestblock-api",
  });
});

/* Start */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
