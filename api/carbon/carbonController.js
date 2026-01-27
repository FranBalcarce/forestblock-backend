export const getCarbonProjects = async (req, res) => {
  try {
    const response = await axios.get(`${CARBONMARK_BASE}/prices`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        minSupply: 100, // 🔑 recomendación Carbonmark
      },
    });

    const prices = response.data || [];

    const projectsMap = {};

    for (const price of prices) {
      // ✅ SOLO listings reales
      if (
        price.type !== "listing" ||
        !price.purchasePrice ||
        price.purchasePrice <= 0 ||
        price.supply <= 0
      ) {
        continue;
      }

      const projectId = price?.listing?.creditId?.projectId;
      if (!projectId) continue;

      if (!projectsMap[projectId]) {
        projectsMap[projectId] = {
          projectId,
          standard: price.listing.creditId.standard,
          minPrice: price.purchasePrice,
          prices: [],
        };
      }

      projectsMap[projectId].prices.push(price);
      projectsMap[projectId].minPrice = Math.min(
        projectsMap[projectId].minPrice,
        price.purchasePrice,
      );
    }

    return res.json({
      count: Object.keys(projectsMap).length,
      items: Object.values(projectsMap),
    });
  } catch (error) {
    console.error("❌ Error fetching carbon projects:", error);
    return res.status(500).json({ message: "Error fetching carbon projects" });
  }
};

// import axios from "axios";

// const CARBONMARK_BASE = "https://v18.api.carbonmark.com";

// const carbonmark = axios.create({
//   baseURL: CARBONMARK_BASE,
//   headers: {
//     Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
//   },
// });

// /* =========================================================
//    GET MARKETPLACE PROJECTS WITH PRICES (CORRECT VERSION)
// ========================================================= */

// export const getCarbonProjects = async (req, res) => {
//   try {
//     const { minSupply = 1 } = req.query;

//     /* 1️⃣ Traer proyectos */
//     const projectsRes = await carbonmark.get("/projects");
//     const projects = projectsRes.data?.items ?? [];

//     const marketplaceProjects = [];

//     /* 2️⃣ Para cada proyecto, traer precios POR projectId */
//     for (const project of projects) {
//       const projectKey = project.key; // ej: "VCS-844"

//       if (!projectKey) continue;

//       const pricesRes = await carbonmark.get("/prices", {
//         params: {
//           projectIds: projectKey,
//           minSupply,
//         },
//       });

//       const prices = pricesRes.data ?? [];

//       if (!prices.length) continue;

//       /* 3️⃣ Calcular precio mínimo */
//       const minPrice = Math.min(
//         ...prices.map((p) => p.purchasePrice).filter(Boolean),
//       );

//       marketplaceProjects.push({
//         ...project,
//         prices,
//         minPrice,
//       });
//     }

//     /* 4️⃣ Respuesta limpia */
//     return res.json({
//       count: marketplaceProjects.length,
//       items: marketplaceProjects,
//     });
//   } catch (error) {
//     console.error(
//       "❌ Error building marketplace:",
//       error.response?.data || error,
//     );

//     return res.status(500).json({
//       message: "Error fetching marketplace projects",
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
