import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import apiRoutes from "./api/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("trust proxy", 1);

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

app.use("/images", express.static("public/images"));
app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use("/api", apiRoutes);

app.get("/", (_, res) => {
  res.json({ status: "ok", service: "forestblock-api" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en ${PORT}`));
