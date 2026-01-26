import carbonmark from "./carbonmarkClient.js";

export const getCarbonProjects = async (req, res) => {
  try {
    const pricesRes = await carbonmark.get("/prices");

    const items = pricesRes.data || [];

    const projectsMap = {};

    items.forEach((item) => {
      const listing = item.listing;
      const token = item.token;

      if (!listing || !token) return;

      const projectId = listing.projectId;

      if (!projectsMap[projectId]) {
        projectsMap[projectId] = {
          projectId,
          vintage: listing.vintage,
          creditId: listing.creditId,
          price: item.purchasePrice,
          basePrice: item.baseUnitPrice,
          supply: item.supply,
          liquidSupply: item.liquidSupply,
          minFillAmount: item.minFillAmount,
          tokenId: token.id,
          tokenName: token.name,
          tokenSymbol: token.symbol,
          tokenDecimals: token.decimals,
        };
      }
    });

    return res.status(200).json({
      items: Object.values(projectsMap),
    });
  } catch (error) {
    console.error(
      "❌ Error fetching carbon projects:",
      error.response?.data || error,
    );
    return res.status(500).json({
      message: "Error fetching carbon projects",
    });
  }
};

// import axios from "axios";

// const CARBONMARK_BASE_URL = "https://v18.api.carbonmark.com";
// const CARBONMARK_API_KEY = process.env.CARBONMARK_API_KEY;

// const carbonmark = axios.create({
//   baseURL: CARBONMARK_BASE_URL,
//   headers: {
//     Authorization: `Bearer ${CARBONMARK_API_KEY}`,
//     "Content-Type": "application/json",
//   },
// });

// /**
//  * GET /api/carbon/carbonProjects
//  * Devuelve SOLO proyectos con listings disponibles
//  */
// export const getCarbonProjects = async (req, res) => {
//   try {
//     // 1️⃣ Prices con supply
//     const pricesRes = await carbonmark.get("/prices", {
//       params: { minSupply: 1 },
//     });

//     const prices = pricesRes.data?.items ?? [];
//     if (!prices.length) {
//       return res.json({ items: [] });
//     }

//     // 2️⃣ Project IDs únicos
//     const projectIds = [
//       ...new Set(prices.map((p) => p.creditId?.projectId).filter(Boolean)),
//     ];

//     // 3️⃣ Pedimos proyectos uno por uno (FORMA CORRECTA)
//     const projects = [];

//     for (const projectId of projectIds) {
//       try {
//         const projectRes = await carbonmark.get(`/projects/${projectId}`);
//         if (projectRes.data) {
//           projects.push(projectRes.data);
//         }
//       } catch (err) {
//         // si alguno falla, no rompe todo
//         console.warn(`Proyecto ${projectId} no encontrado`);
//       }
//     }

//     return res.json({ items: projects });
//   } catch (error) {
//     console.error(
//       "❌ Error fetching carbon projects:",
//       error.response?.data || error.message,
//     );
//     return res.status(500).json({
//       error: "Failed to fetch carbon projects",
//     });
//   }
// };

// /**
//  * GET /api/carbon/prices
//  */
// export const getPrices = async (req, res) => {
//   try {
//     const response = await carbonmark.get("/prices", {
//       params: { minSupply: 1 },
//     });

//     return res.json({
//       items: response.data?.items ?? [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching prices:", error.response?.data || error);
//     return res.status(500).json({
//       error: "Failed to fetch prices",
//     });
//   }
// };

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
