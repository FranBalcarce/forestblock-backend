import express from "express";
import * as controller from "./retirementsController.js";

const router = express.Router();

router.get("/summary", controller.getRetirementsSummary);
router.post("/registerRetirement", controller.createRetirement);
router.get("/byPaymentId/:paymentId", controller.getRetirementByPaymentId);
router.get("/:id/:walletAddress", controller.getRetirementDetail);
router.get("/", controller.getRetirementsList);

export default router;

// const express = require("express");
// const router = express.Router();
// const {
//   createRetirement,
//   getRetirementsList,
//   getRetirementDetail,
//   getRetirementByPaymentId,
//   getRetirementsSummary, // 👈 nuevo import
// } = require("./retirementsController");

// // ⚠️ Importante: la ruta fija va ANTES de las rutas con parámetros
// router.get("/summary", getRetirementsSummary); // GET /api/retirements/summary?walletAddress=...

// router.post("/registerRetirement", createRetirement);
// router.get("/byPaymentId/:paymentId", getRetirementByPaymentId);
// router.get("/:id/:walletAddress", getRetirementDetail);
// router.get("/", getRetirementsList);

// module.exports = router;
