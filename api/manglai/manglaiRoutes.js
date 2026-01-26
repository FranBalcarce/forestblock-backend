import express from "express";
import * as controller from "./manglaiController.js";

const router = express.Router();

router.get("/categories", controller.fetchCategories);
router.get("/summary/:companyId", controller.fetchDashboard);
router.get("/buildings/:companyId", controller.fetchBuildings);
router.get("/consumptions/:companyId", controller.fetchConsumptions);
router.get("/vehicles/:companyId", controller.fetchVehicles);
router.get("/employees/:companyId", controller.fetchEmployees);

export default router;

// const express = require("express");
// const {
//   fetchBuildings,
//   fetchCategories,
//   fetchDashboard,
//   fetchConsumptions,
//   fetchConsumptionById,
//   fetchEmissions,
//   fetchVehicles,
//   fetchVehicleById,
//   fetchEmissionsDashboard,
//   fetchEmployees,
// } = require("./manglaiController.js");

// const router = express.Router();

// router.get("/categories", fetchCategories);

// router.get("/summary/:companyId", fetchDashboard);

// router.get("/buildings/:companyId", fetchBuildings);

// router.get("/emissions", fetchEmissions);
// router.get("/emissions/:companyId", fetchEmissionsDashboard);

// router.get("/consumptions/:companyId", fetchConsumptions);
// router.get("/consumptions/:id/:companyId", fetchConsumptionById);

// router.get("/vehicles/:companyId", fetchVehicles);
// router.get("/vehicles/:id/:companyId", fetchVehicleById);

// router.get("/employees/:companyId", fetchEmployees);

// module.exports = router;
