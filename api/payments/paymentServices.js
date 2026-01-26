import { Alchemy, Network } from "alchemy-sdk";
import mongoose from "mongoose";
import PaymentModel from "./paymentModel.js";

const ENVIRONMENT = process.env.ENVIRONMENT || "development";

let network;
let tokenContractAddress;

if (ENVIRONMENT === "production") {
  network = Network.MATIC_MAINNET;
  tokenContractAddress =
    "0xc2132d05d31c914a87c6611c10748aeb04b58e8f".toLowerCase(); // USDT Mainnet
} else {
  network = Network.ETH_SEPOLIA;
  tokenContractAddress =
    "0x779877A7B0D9E8603169DdbD7836e478b4624789".toLowerCase(); // LINK Sepolia
}

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network,
});

/* =========================================================
   MONITOR WALLET
========================================================= */
export const monitorSingleWallet = async (
  walletAddress,
  paymentId,
  expectedAmount,
) => {
  console.log(`🔍 Monitoring wallet: ${walletAddress}`);

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    console.error("❌ Invalid paymentId:", paymentId);
    return;
  }

  const MAX_TIME = 10 * 60 * 1000;
  const INTERVAL = 5000;
  const start = Date.now();

  let balance = 0;
  const processed = new Set();

  const interval = setInterval(async () => {
    try {
      if (Date.now() - start > MAX_TIME) {
        console.log("⏱️ Monitoring timeout");
        clearInterval(interval);
        return;
      }

      const res = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toAddress: walletAddress,
        contractAddresses: [tokenContractAddress],
        category: ["erc20"],
        excludeZeroValue: true,
      });

      for (const tx of res.transfers) {
        if (processed.has(tx.hash)) continue;

        processed.add(tx.hash);

        const amount = Number(tx.value);
        if (!isNaN(amount)) {
          balance += amount;
        }

        await PaymentModel.findByIdAndUpdate(paymentId, {
          amountReceived: balance,
        });
      }

      if (balance >= expectedAmount) {
        console.log("✅ Payment confirmed");

        await PaymentModel.findByIdAndUpdate(paymentId, {
          status: "CONFIRMED",
        });

        clearInterval(interval);
      }
    } catch (err) {
      console.error("monitorSingleWallet error:", err);
    }
  }, INTERVAL);
};
