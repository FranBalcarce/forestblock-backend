const PaymentModel = require("./paymentModel");
const { ethers } = require("ethers");
const { monitorSingleWallet } = require("./paymentServices");

// 🔐 Validación temprana de Stripe
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// ============================
// GENERATE PAYMENT
// ============================
exports.generatePayment = async (req, res) => {
  try {
    const { amount, tonnesToRetire, metadata, userId, type, formData } =
      req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!tonnesToRetire || tonnesToRetire <= 0) {
      return res.status(400).json({ message: "Invalid tonnes to retire" });
    }

    switch (type) {
      case "usdt": {
        const newWallet = ethers.Wallet.createRandom();
        const walletAddress = newWallet.address;
        const privateKey = newWallet.privateKey;
        const network = "Sepolia";

        const newPayment = await PaymentModel.create({
          userId,
          walletAddress,
          privateKey,
          network,
          amount,
          tonnesToRetire,
          type,
          status: "PENDING",
          metadata: metadata || {},
        });

        await monitorSingleWallet(walletAddress, newPayment._id, amount);

        const qrPayload = `ethereum:${walletAddress}?value=${amount}&chainId=137`;

        return res.status(200).json({
          paymentData: {
            paymentId: newPayment._id,
            address: walletAddress,
            amount,
            network,
            type,
          },
          qrPayload,
        });
      }

      case "stripe": {
        const newStripePayment = await PaymentModel.create({
          userId,
          amount,
          tonnesToRetire,
          status: "PENDING",
          metadata: metadata || {},
          type,
          beneficiary_name: formData?.beneficiary,
          retirement_message: formData?.message,
        });

        return res.status(200).json({
          paymentData: {
            paymentId: newStripePayment._id,
            amount,
            type,
          },
        });
      }

      default:
        return res
          .status(400)
          .json({ message: "Invalid payment type (stripe, usdt)" });
    }
  } catch (error) {
    console.error("Error generating payment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ============================
// CHECK PAYMENT STATUS
// ============================
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required." });
    }

    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    res.status(200).json({
      status: payment.status,
      amountReceived: payment.amountReceived,
    });
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ============================
// GET PAYMENT DETAILS
// ============================
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required." });
    }

    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    res.status(200).json({
      paymentData: {
        paymentId: payment._id,
        userId: payment.userId,
        walletAddress: payment.walletAddress,
        network: payment.network,
        amount: payment.amount,
        tonnesToRetire: payment.tonnesToRetire,
        status: payment.status,
        metadata: payment.metadata,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        amountReceived: payment.amountReceived,
        beneficiary: payment.beneficiary_name,
        message: payment.retirement_message,
        orderStatus: payment.order?.status,
      },
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ============================
// STRIPE CHECKOUT SESSION
// ============================
exports.createCheckoutSession = async (req, res) => {
  try {
    const { pricePerUnit, quantity, paymentId, name } = req.body;

    const unitAmountInCents = Math.round(pricePerUnit * 100);

    if (!Number.isInteger(unitAmountInCents) || unitAmountInCents <= 0) {
      return res.status(400).json({ message: "Invalid pricePerUnit" });
    }

    if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const totalAmount = unitAmountInCents * quantity;
    if (totalAmount < 50) {
      return res
        .status(400)
        .json({ message: "Total amount must be at least $0.50 USD" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name },
            unit_amount: unitAmountInCents,
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FORESTBLOCK_DOMAIN}/retirementSteps?session_id={CHECKOUT_SESSION_ID}&paymentId=${paymentId}`,
      cancel_url: `${process.env.FORESTBLOCK_DOMAIN}/retireCheckout/cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

// ============================
// CHANGE PAYMENT STATUS
// ============================
exports.changePaymentStatus = async (req, res) => {
  try {
    const { paymentId, stripeSessionId, status } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "Payment ID is required." });
    }

    const updatedPayment = await PaymentModel.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status,
          stripeSessionId,
        },
      },
      { new: true },
    );

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    res.status(200).json({ status: updatedPayment.status });
  } catch (error) {
    console.error("Error changing payment status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
