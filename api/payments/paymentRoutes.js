const express = require("express");
const {
  generatePayment,
  checkPaymentStatus,
  getPaymentDetails,
  createCheckoutSession,
  changePaymentStatus,
} = require("./paymentController.js");

const router = express.Router();

router.post("/generate-payment", generatePayment);
router.get("/check-payment-status", checkPaymentStatus);
router.get("/:paymentId", getPaymentDetails);
router.post("/create-checkout-session", createCheckoutSession);
router.put("/change-payment-status", changePaymentStatus);

module.exports = router;
