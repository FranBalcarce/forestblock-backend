import express from "express";
import { sendOTPController, verifyOTPController } from "./authController.js";

const router = express.Router();

router.post("/send-otp", sendOTPController);
router.post("/verify-otp", verifyOTPController);

export default router;

// import express from "express";

// const router = express.Router();

// router.post("/login", (req, res) => {
//   res.json({ message: "login ok" });
// });

// // 👉 lo importante
// export default router;
