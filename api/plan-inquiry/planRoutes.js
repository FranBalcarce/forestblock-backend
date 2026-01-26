import express from "express";
import { getPlanInquiry } from "./planController.js";

const router = express.Router();

// 👉 queda /api/plan
router.post("/", getPlanInquiry);

export default router;
