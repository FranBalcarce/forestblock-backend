import express from "express";
import { getMarketplaceProjects, getListingById } from "./carbonController.js";

const router = express.Router();

// 🔥 Marketplace principal
router.get("/marketplace", getMarketplaceProjects);

// 🔥 Traer listing individual (para checkout)
router.get("/listings", getListingById);

export default router;

// const express = require("express");
// const {
//   generateQuote,
//   createOrder,
//   getOrderDetails,
//   sharePdf,
//   getCarbonProjects,
//   getCarbonProjectById,
//   getPrices,
//   pollOrderStatus,
// } = require("./carbonController.js");

// const router = express.Router();

// router.get("/carbonProjects", getCarbonProjects);
// router.get("/carbonProjects/:id", getCarbonProjectById);
// router.get("/orders/:orderId", getOrderDetails);
// router.get("/prices", getPrices);
// router.get("/orders", pollOrderStatus);
// router.post("/generate-quote", generateQuote);
// router.post("/create-order", createOrder);
// router.post("/sharePDF", sharePdf);

// module.exports = router;
