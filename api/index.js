const express = require("express");
const authRoutes = require("./auth/authRoutes");
const userRoutes = require("./users/userRoutes");
const paymentRoutes = require("./payments/paymentRoutes");
const carbonRoutes = require("./carbon/carbonRoutes");
const manglaiRoutes = require("./manglai/manglaiRoutes");
const retirementsRoutes = require("./retirements/retirementsRoutes");
const klimapiRoutes = require("./klimapi/klimapiRoutes");
const planInquiryRoutes = require("./plan-inquiry/planRoutes");

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
router.use("/klimapi", klimapiRoutes);
router.use("/plan", planInquiryRoutes);

module.exports = router;
