const express = require("express");
const {
  generateQuote,
  createOrder,
  getOrderDetails,
  sharePdf,
  getCarbonProjects,
  getCarbonProjectById,
  getPrices,
  pollOrderStatus,
} = require("./carbonController");

const router = express.Router();

router.get("/carbonProjects", getCarbonProjects);
router.get("/carbonProjects/:id", getCarbonProjectById);

router.get("/prices", getPrices);

router.get("/orders/:orderId", getOrderDetails);
router.get("/orders", pollOrderStatus);

router.post("/generate-quote", generateQuote);
router.post("/create-order", createOrder);
router.post("/sharePDF", sharePdf);

module.exports = router;

// const express = require("express");
// const {
//   generateQuote,
//   createOrder,
//   getOrderDetails,
//   sharePdf,
//   getCarbonProjects,
//   getCarbonProjectById,
//   getPrices,
//   pollOrderStatus,
// } = require("./carbonController.js");

// const router = express.Router();

// router.get("/carbonProjects", getCarbonProjects);
// router.get("/carbonProjects/:id", getCarbonProjectById);
// router.get("/orders/:orderId", getOrderDetails);
// router.get("/prices", getPrices);
// router.get("/orders", pollOrderStatus);
// router.post("/generate-quote", generateQuote);
// router.post("/create-order", createOrder);
// router.post("/sharePDF", sharePdf);

// module.exports = router;
