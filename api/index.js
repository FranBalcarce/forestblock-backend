import express from "express";

import authRoutes from "./auth/authRoutes.js";
import userRoutes from "./users/userRoutes.js";
import paymentRoutes from "./payments/paymentRoutes.js";
import carbonRoutes from "./carbon/carbonRoutes.js";
import manglaiRoutes from "./manglai/manglaiRoutes.js";
import retirementsRoutes from "./retirements/retirementsRoutes.js";
import planInquiryRoutes from "./plan-inquiry/planRoutes.js";

const router = express.Router();

router.get("/", (_, res) => {
  res.send("Forestblock API funcionando 🌱");
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/payments", paymentRoutes);
router.use("/carbon", carbonRoutes);
router.use("/manglai", manglaiRoutes);
router.use("/retirements", retirementsRoutes);
router.use("/plan", planInquiryRoutes);

export default router;
