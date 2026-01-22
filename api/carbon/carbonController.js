const axios = require("axios");

const CARBONMARK_API = "https://api.carbonmark.com";

if (!process.env.CARBONMARK_API_KEY) {
  throw new Error("CARBONMARK_API_KEY is not defined");
}

const headers = {
  Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
};

/* =========================
   GET CARBON PROJECTS
========================= */
exports.getCarbonProjects = async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.carbonmark.com/v18/projects",
      { headers },
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("CARBONMARK ERROR STATUS:", error.response?.status);
    console.error("CARBONMARK ERROR DATA:", error.response?.data);
    console.error("CARBONMARK ERROR MSG:", error.message);

    res.status(500).json({
      error: "Failed to fetch carbon projects",
      status: error.response?.status,
      details: error.response?.data || error.message,
    });
  }
};

/* =========================
   GET PROJECT BY ID
========================= */
exports.getCarbonProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${CARBONMARK_API}/projects/${id}`, {
      headers,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error fetching carbon project:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to fetch carbon project" });
  }
};

/* =========================
   GET PRICES (LISTINGS)
========================= */
exports.getPrices = async (req, res) => {
  try {
    const { projectIds } = req.query;

    const response = await axios.get(`${CARBONMARK_API}/prices`, {
      headers,
      params: {
        projectIds,
        minSupply: 1,
      },
    });

    const validListings = response.data.filter(
      (p) =>
        p.type === "listing" &&
        typeof p.purchasePrice === "number" &&
        p.supply > 0 &&
        p.listing?.creditId?.projectId,
    );

    res.status(200).json(validListings);
  } catch (error) {
    console.error(
      "Error fetching prices:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to fetch prices" });
  }
};

/* =========================
   GENERATE QUOTE
========================= */
exports.generateQuote = async (req, res) => {
  try {
    const response = await axios.post(`${CARBONMARK_API}/quotes`, req.body, {
      headers,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error generating quote:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to generate quote" });
  }
};

/* =========================
   CREATE ORDER
========================= */
exports.createOrder = async (req, res) => {
  try {
    const response = await axios.post(`${CARBONMARK_API}/orders`, req.body, {
      headers,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error creating order:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to create order" });
  }
};

/* =========================
   GET ORDER DETAILS
========================= */
exports.getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    const response = await axios.get(`${CARBONMARK_API}/orders/${orderId}`, {
      headers,
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error fetching order:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

/* =========================
   POLL ORDER STATUS
========================= */
exports.pollOrderStatus = async (req, res) => {
  try {
    const response = await axios.get(`${CARBONMARK_API}/orders`, { headers });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Error polling orders:",
      error.response?.data || error.message,
    );
    res.status(500).json({ error: "Failed to poll orders" });
  }
};

/* =========================
   SHARE PDF
========================= */
exports.sharePdf = async (req, res) => {
  try {
    const response = await axios.post(
      `${CARBONMARK_API}/orders/share`,
      req.body,
      { headers },
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error sharing PDF:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to share PDF" });
  }
};

// const qs = require("qs");
// const {
//   validateQuoteRequest,
//   getPaymentById,
//   requestQuote,
//   createOrderService,
// } = require("./carbonServices");
// const firebaseAdmin = require("../utils/firebaseAdmin");
// const retirementsModel = require("../retirements/retirementsModel");
// const axiosInstance = require("../utils/axiosInstance");
// const { generateAndSavePdf } = require("../utils/pdfService");
// const bucket = firebaseAdmin.storage().bucket();

// exports.generateQuote = async (req, res) => {
//   try {
//     const { paymentId, quantityTonnes } = validateQuoteRequest(req.body);

//     const payment = await getPaymentById(paymentId);

//     if (payment.quote && payment.quote.uuid) {
//       return res.status(200).json({ quoteId: payment.quote.uuid });
//     }

//     const quoteData = await requestQuote(quantityTonnes);

//     payment.quote = quoteData;
//     await payment.save();

//     res.status(200).json({ quoteId: quoteData.uuid });
//   } catch (err) {
//     console.error("Error al generar la cotización:", err.response?.data || err);
//     const status = err.status || err.response?.status || 500;
//     res.status(status).json({
//       message: err.message || "Error al generar la cotización.",
//     });
//   }
// };

// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       paymentId,
//       beneficiaryName,
//       retirementMessage,
//       consumptionMetadata,
//       beneficiaryAddress,
//     } = req.body;

//     const orderData = await createOrderService({
//       paymentId,
//       beneficiaryName,
//       retirementMessage,
//       consumptionMetadata,
//       beneficiaryAddress,
//     });

//     res.status(200).json({ order: orderData });
//   } catch (err) {
//     console.error("Error al crear la orden:", err.response?.data || err);
//     res
//       .status(err.status || 500)
//       .json({ message: err.message || "Error al crear la orden." });
//   }
// };

// exports.getOrderDetails = async (req, res) => {
//   try {
//     const quoteUuid = req.params.orderId;

//     if (!quoteUuid) {
//       return res.status(400).json({ message: "Quote UUID is required." });
//     }

//     const response = await axiosInstance.get(`orders?quote_uuid=${quoteUuid}`);
//     const orderDetails = response.data;
//     res.status(200).json({ orderDetails });
//   } catch (error) {
//     console.error(
//       "Error fetching order details:",
//       error.response?.data || error
//     );
//     res
//       .status(error.response?.status || 500)
//       .json({ message: "Error fetching order details." });
//   }
// };

// exports.sharePdf = async (req, res) => {
//   try {
//     const { params } = req.body;
//     if (!params) throw new Error("No se recibió el objeto 'params' en el body");

//     const {
//       beneficiaryName = "Nombre de usuario",
//       createdAt,
//       quantityTonnes = 1,
//       retirementId,
//       projectName,
//       projectMethodology,
//       projectMethodologyType,
//       projectType,
//       projectUrl
//     } = params;

//     const fileName = `certificados/${retirementId}.pdf`;
//     const file = bucket.file(fileName);
//     const [exists] = await file.exists();

//     const retirement = await retirementsModel.findById({ _id: retirementId });

//     let publicUrl;
//     if (exists) {
//       publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`;
//     } else {
//       publicUrl = await generateAndSavePdf({
//         createdAt,
//         beneficiaryName,
//         quantityTonnes,
//         retirementId,
//         projectName,
//         projectMethodology,
//         projectMethodologyType,
//         projectType,
//         projectUrl
//       });
//     }

//     if (retirement) {
//       retirement.project.pdfUrl = publicUrl;
//       await retirement.save();
//     }
//     res.status(200).json({ url: publicUrl });
//   } catch (error) {
//     console.error("Error generando PDF para compartir:", error);
//     res.status(500).send("Error generando el PDF");
//   }
// };

// exports.getCarbonProjects = async (req, res) => {
//   try {
//     const { minSupply, country } = req.query;

//     const response = await axiosInstance.get("carbonProjects", {
//       params: {
//         minSupply,
//         country,
//       },
//       paramsSerializer: (params) =>
//         qs.stringify(params, { arrayFormat: "repeat" }),
//     });

//     return res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching projects:", error.response?.data || error);
//     return res.status(500).json({ message: "Error fetching projects." });
//   }
// };

// exports.getCarbonProjectById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const response = await axiosInstance.get(`carbonProjects/${id}`);
//     return res.json(response.data);
//   } catch (error) {
//     console.error(
//       "Error fetching project details:",
//       error.response?.data || error
//     );
//     return res.status(500).json({ message: "Error fetching project details." });
//   }
// };

// exports.getPrices = async (req, res) => {
//   try {
//     const { projectIds, minSupply } = req.query;

//     const response = await axiosInstance.get("prices", {
//       params: {
//         projectIds,
//         minSupply,
//       },
//       paramsSerializer: (params) =>
//         qs.stringify(params, { arrayFormat: "repeat" }),
//     });

//     return res.json(response.data);
//   } catch (error) {
//     console.error("Error fetching prices:", error.response?.data || error);
//     return res.status(500).json({ message: "Error fetching prices." });
//   }
// };

// exports.pollOrderStatus = async (req, res) => {
//   try {
//     const { quote_uuid } = req.query;
//     if (!quote_uuid) {
//       return res
//         .status(400)
//         .json({ message: "Se requiere el parámetro quote_uuid." });
//     }

//     const response = await axiosInstance.get(`orders?quote_uuid=${quote_uuid}`);
//     return res.json(response.data);
//   } catch (error) {
//     console.error("Error polling order status:", error.response?.data || error);
//     return res
//       .status(500)
//       .json({ message: "Error al obtener el estado de la orden." });
//   }
// };
