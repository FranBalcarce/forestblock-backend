const express = require("express");
const { calculate, saveCalculationResult, getUserResults } = require("./klimapiController.js");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/calculate", calculate);
router.post("/calculate/save", protect, saveCalculationResult);
router.get("/calculate/results", protect, getUserResults);

module.exports = router;
