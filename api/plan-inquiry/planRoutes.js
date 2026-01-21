const express = require("express");
const { getPlanInquiry } = require("./planController.js");

const router = express.Router();

router.post("/plan-inquiry", getPlanInquiry);

module.exports = router;
