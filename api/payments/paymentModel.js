import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletAddress: String,
    privateKey: String,
    network: String,
    amount: Number,
    tonnesToRetire: Number,
    status: String,
    metadata: Object,
    type: { type: String, enum: ["usdt", "stripe"], required: true },
    stripeSessionId: String,
    amountReceived: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Payment", PaymentSchema);

// const mongoose = require("mongoose");

// const PaymentSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     walletAddress: { type: String },
//     privateKey: { type: String },
//     network: { type: String, default: "Sepolia testnet" },
//     amount: { type: Number, required: true },
//     tonnesToRetire: { type: Number, required: true },
//     status: {
//       type: String,
//       enum: ["PENDING", "CONFIRMED", "FAILED", "ORDER_CREATED"],
//       default: "PENDING",
//     },
//     beneficiary_name: { type: String },
//     retirement_message: { type: String },
//     metadata: { type: Object },
//     quote: { type: Object },
//     order: { type: Object },
//     amountReceived: { type: Number, default: 0 },
//     type: {
//       type: String,
//       enum: ["usdt", "stripe"],
//       required: true,
//     },
//     stripeSessionId: { type: String },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Payment", PaymentSchema);
