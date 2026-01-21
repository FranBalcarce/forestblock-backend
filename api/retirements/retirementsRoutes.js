const express = require("express");
const router = express.Router();
const {
  createRetirement,
  getRetirementsList,
  getRetirementDetail,
  getRetirementByPaymentId,
  getRetirementsSummary, // 👈 nuevo import
} = require("./retirementsController");

// ⚠️ Importante: la ruta fija va ANTES de las rutas con parámetros
router.get("/summary", getRetirementsSummary); // GET /api/retirements/summary?walletAddress=...

router.post("/registerRetirement", createRetirement);
router.get("/byPaymentId/:paymentId", getRetirementByPaymentId);
router.get("/:id/:walletAddress", getRetirementDetail);
router.get("/", getRetirementsList);

module.exports = router;
