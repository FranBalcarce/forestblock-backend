import PaymentModel from "./paymentModel.js";
import { ethers } from "ethers";
import { monitorSingleWallet } from "./paymentServices.js";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ============================
   GENERATE PAYMENT
============================ */
export const generatePayment = async (req, res) => {
  try {
    const { amount, tonnesToRetire, metadata, userId, type, formData } =
      req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!tonnesToRetire || tonnesToRetire <= 0) {
      return res.status(400).json({ message: "Invalid tonnes to retire" });
    }

    if (type === "usdt") {
      const wallet = ethers.Wallet.createRandom();

      const payment = await PaymentModel.create({
        userId,
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        amount,
        tonnesToRetire,
        type,
        status: "PENDING",
        metadata: metadata || {},
      });

      monitorSingleWallet(wallet.address, payment._id, amount);

      return res.status(200).json({
        paymentData: {
          paymentId: payment._id,
          address: wallet.address,
          amount,
          type,
        },
      });
    }

    if (type === "stripe") {
      const payment = await PaymentModel.create({
        userId,
        amount,
        tonnesToRetire,
        status: "PENDING",
        type,
        metadata,
        beneficiary_name: formData?.beneficiary,
        retirement_message: formData?.message,
      });

      return res.status(200).json({
        paymentData: {
          paymentId: payment._id,
          amount,
          type,
        },
      });
    }

    return res.status(400).json({ message: "Invalid payment type" });
  } catch (error) {
    console.error("generatePayment error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ============================
   CHECK PAYMENT STATUS
============================ */
export const checkPaymentStatus = async (req, res) => {
  const { paymentId } = req.query;

  if (!paymentId) {
    return res.status(400).json({ message: "Payment ID is required" });
  }

  const payment = await PaymentModel.findById(paymentId);

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  res.json({
    status: payment.status,
    amountReceived: payment.amountReceived,
  });
};

/* ============================
   GET PAYMENT DETAILS
============================ */
export const getPaymentDetails = async (req, res) => {
  const { paymentId } = req.params;

  const payment = await PaymentModel.findById(paymentId);

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  res.json({ paymentData: payment });
};

/* ============================
   STRIPE CHECKOUT
============================ */
export const createCheckoutSession = async (req, res) => {
  const { pricePerUnit, quantity, paymentId, name } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name },
          unit_amount: Math.round(pricePerUnit * 100),
        },
        quantity,
      },
    ],
    success_url: `${process.env.FORESTBLOCK_DOMAIN}/retirementSteps?paymentId=${paymentId}`,
    cancel_url: `${process.env.FORESTBLOCK_DOMAIN}/retireCheckout/cancel`,
  });

  res.json({ url: session.url });
};

/* ============================
   CHANGE PAYMENT STATUS
============================ */
export const changePaymentStatus = async (req, res) => {
  const { paymentId, status, stripeSessionId } = req.body;

  const payment = await PaymentModel.findByIdAndUpdate(
    paymentId,
    { status, stripeSessionId },
    { new: true },
  );

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  res.json({ status: payment.status });
};
