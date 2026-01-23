import express from "express";

import authRoutes from "./auth/authRoutes.js";
import carbonRoutes from "./carbon/carbonRoutes.js";

const router = express.Router();

router.get("/", (_, res) => {
  res.send("Forestblock API funcionando 🌱");
});

router.use("/auth", authRoutes);
router.use("/carbon", carbonRoutes);

export default router;
