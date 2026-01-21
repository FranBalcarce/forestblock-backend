const paymentModel = require("../payments/paymentModel");
const axiosInstance = require("../utils/axiosInstance");

/* ========= HELPERS ========= */

const unwrapItems = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
};

/* ========= PROJECTS ========= */

const fetchCarbonProjects = async (params = {}) => {
  const response = await axiosInstance.get("/carbonProjects", { params });
  return unwrapItems(response.data);
};

const fetchCarbonProjectById = async (id) => {
  const response = await axiosInstance.get(`/carbonProjects/${id}`);
  return response.data;
};

/* ========= PRICES ========= */

const fetchPrices = async (params = {}) => {
  const response = await axiosInstance.get("/prices", { params });
  return unwrapItems(response.data);
};

/* ========= QUOTES ========= */

const requestQuote = async ({ quantityTonnes, assetPriceSourceId }) => {
  const response = await axiosInstance.post("/quotes", {
    asset_price_source_id: assetPriceSourceId,
    quantity_tonnes: quantityTonnes,
  });
  return response.data;
};

/* ========= ORDERS ========= */

const createOrderService = async ({
  paymentId,
  beneficiaryName,
  retirementMessage,
  beneficiaryAddress,
  consumptionMetadata = {},
}) => {
  const payment = await paymentModel.findById(paymentId);
  if (!payment) throw new Error("Pago no encontrado");

  if (!payment.quote?.uuid) throw new Error("Quote inexistente");

  const response = await axiosInstance.post("/orders", {
    quote_uuid: payment.quote.uuid,
    beneficiary_name: beneficiaryName,
    retirement_message: retirementMessage,
    beneficiary_address: beneficiaryAddress,
    consumption_metadata: consumptionMetadata,
  });

  payment.order = response.data;
  await payment.save();

  return response.data;
};

module.exports = {
  fetchCarbonProjects,
  fetchCarbonProjectById,
  fetchPrices,
  requestQuote,
  createOrderService,
};

// const PDFDocument = require("pdfkit");
// const path = require("path");
// const paymentModel = require("../payments/paymentModel");
// const axiosInstance = require("../utils/axiosInstance");

// const createPDFDocument = () => {
//   const doc = new PDFDocument({
//     size: "A4",
//     layout: "landscape",
//     margins: { top: 0, left: 0, bottom: 0, right: 0 },
//   });
//   return doc;
// };

// const registerFonts = (doc) => {
//   doc.registerFont(
//     "Aeonik-Bold",
//     path.join(__dirname, "../../public/fonts/Aeonik-Bold.otf")
//   );
//   doc.registerFont(
//     "Aeonik-Medium",
//     path.join(__dirname, "../../public/fonts/Aeonik-Medium.otf")
//   );
//   doc.registerFont(
//     "Aeonik-Regular",
//     path.join(__dirname, "../../public/fonts/Aeonik-Regular.otf")
//   );
// };

// const formatDate = (createdAt) => {
//   const validDateString =
//     createdAt?.replace(/(\.\d{3})\d+/, "$1") || new Date().toISOString();
//   const dateObj = new Date(validDateString);
//   return dateObj.toLocaleDateString("es-ES", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// };

// const drawImages = (doc) => {
//   const leftImagePath = path.join(__dirname, "../../public/images/left.png");
//   const rightImagePath = path.join(__dirname, "../../public/images/right.png");
//   const smallLogoPath = path.join(
//     __dirname,
//     "../../public/images/small-logo.png"
//   );

//   doc.image(leftImagePath, 0, 460, { width: 250 });
//   doc.image(rightImagePath, 650, 0, { width: 400 });

//   return smallLogoPath;
// };

// const drawHeader = (doc, formattedDate, pageW) => {
//   // Fecha en esquina superior izquierda
//   doc
//     .font("Aeonik-Bold")
//     .fontSize(12)
//     .fillColor("#182D1F")
//     .text(formattedDate, 20, 20);

//   // Título "Prueba de"
//   doc
//     .font("Aeonik-Bold")
//     .fontSize(20)
//     .fillColor("#182D1F")
//     .text("Prueba de", 0, 40, {
//       align: "center",
//       width: pageW,
//     });

//   // Título "Retiro de Créditos de Carbono"
//   doc
//     .font("Aeonik-Bold")
//     .fontSize(30)
//     .fillColor("#182D1F")
//     .text("Retiro de Créditos de Carbono", 0, 70, {
//       align: "center",
//       width: pageW,
//     });
// };

// const drawTonnes = (doc, quantityTonnes, pageW) => {
//   doc
//     .font("Aeonik-Bold")
//     .fontSize(90)
//     .fillColor("#99EE9F")
//     .text(String(quantityTonnes), 0, 100, {
//       align: "center",
//       width: pageW,
//     });
// };

// const drawContent = (doc, beneficiaryName, pageW) => {
//   // "TONELADA VERIFICADA DE CARBONO RETIRADA"
//   doc
//     .font("Aeonik-Medium")
//     .fontSize(14)
//     .fillColor("#182D1F")
//     .text("TONELADA VERIFICADA DE CARBONO RETIRADA", 0, 220, {
//       align: "center",
//       width: pageW,
//     });

//   // "EN NOMBRE DE"
//   doc
//     .font("Aeonik-Medium")
//     .fontSize(12)
//     .fillColor("#787E8A")
//     .text("EN NOMBRE DE", 0, 270, {
//       align: "center",
//       width: pageW,
//     });

//   // Nombre del beneficiario
//   doc
//     .font("Aeonik-Bold")
//     .fontSize(30)
//     .fillColor("#182D1F")
//     .text(beneficiaryName, 0, 290, {
//       align: "center",
//       width: pageW,
//     });

//   // Texto adicional
//   doc
//     .font("Aeonik-Medium")
//     .fontSize(12)
//     .fillColor("#182D1F")
//     .text(
//       "Esto representa el retiro permanente de créditos de carbono.\nEste retiro y los datos asociados son registros públicos inmutables.",
//       0,
//       350,
//       {
//         align: "center",
//         width: pageW,
//       }
//     );
// };

// const drawRetirementId = (doc, retirementId, pageW) => {
//   if (retirementId) {
//     const boldPart = "ID de retiro: ";
//     const normalPart = retirementId;

//     doc.font("Aeonik-Medium").fontSize(12);
//     const boldWidth = doc.widthOfString(boldPart);

//     doc.font("Aeonik-Regular").fontSize(12);
//     const normalWidth = doc.widthOfString(normalPart);

//     const totalWidth = boldWidth + normalWidth;
//     const xCoord = (pageW - totalWidth) / 2;
//     const yCoord = 400;

//     doc
//       .font("Aeonik-Medium")
//       .fontSize(12)
//       .fillColor("#182D1F")
//       .text(boldPart, xCoord, yCoord, { lineBreak: false });

//     doc
//       .font("Aeonik-Regular")
//       .fontSize(12)
//       .fillColor("#182D1F")
//       .text(normalPart, xCoord + boldWidth, yCoord);
//   }
// };

// const drawRetirementDisclaimer = (doc, pageW) => {
//   const disclaimerText = "Este certificado confirma la reducción de emisiones de CO₂\nde acuerdo con los estándares internacionales\ny ha sido verificado para evitar doble contabilidad.";

//   doc
//     .font("Aeonik-Medium")
//     .fontSize(12)
//     .fillColor("#182D1F")
//     .text(disclaimerText, 0, 435, {
//       align: "center",
//       width: pageW,
//       lineBreak: true,
//       lineGap: 4
//     });
// };

// const drawProjectInfo = (
//   doc,
//   pageW,
//   projectName,
//   projectMethodology,
//   projectMethodologyType,
//   projectType
// ) => {
//   doc.font("Aeonik-Medium").fontSize(10).fillColor("#182D1F");

//   const yPos = 510;
//   const items = [
//     projectName,
//     projectMethodology,
//     projectMethodologyType,
//     projectType,
//   ];

//   const padding = 15;

//   const widths = items.map(text => doc.widthOfString(text));

//   const totalBlockWidth =
//     widths.reduce((sum, w) => sum + w, 0) + padding * (items.length - 1);

//   let x = (pageW - totalBlockWidth) / 2;

//   items.forEach((text, i) => {
//     doc.text(text, x, yPos);
//     x += widths[i] + padding;
//   });
// };

// const drawFooter = (doc, pageW, pageH, smallLogoPath) => {
//   const footerText = "Facilitado por Forestblock";
//   const textSize = 12;
//   const footerY = pageH - 35;
//   const logoWidth = 14;
//   const logoPadding = 5;

//   doc.font("Aeonik-Bold").fontSize(textSize);
//   const textWidth = doc.widthOfString(footerText);

//   const totalFooterWidth = logoWidth + logoPadding + textWidth;
//   const footerX = pageW - 40 - totalFooterWidth;

//   doc.image(smallLogoPath, footerX, footerY - 2, { width: logoWidth });
//   doc.text(footerText, footerX + logoWidth + logoPadding, footerY, {
//     width: textWidth,
//     align: "left",
//   });
// };

// const validateQuoteRequest = ({ paymentId, quantityTonnes }) => {
//   if (!paymentId || !quantityTonnes) {
//     const error = new Error("Faltan datos requeridos.");
//     error.status = 400;
//     throw error;
//   }
//   return { paymentId, quantityTonnes };
// };

// const getPaymentById = async (paymentId) => {
//   const payment = await paymentModel.findById(paymentId);
//   if (!payment) {
//     const error = new Error("Pago no encontrado.");
//     error.status = 404;
//     throw error;
//   }
//   return payment;
// };

// const requestQuote = async (quantityTonnes) => {
//   const response = await axiosInstance.post("quotes", {
//     asset_price_source_id:
//       "carbon_pool-137-0xccacc6099debd9654c6814fcb800431ef7549b10-0-bct",
//     quantity_tonnes: quantityTonnes,
//   });
//   return response.data;
// };

// async function createOrderService({
//   paymentId,
//   beneficiaryName,
//   retirementMessage,
//   consumptionMetadata = {},
//   beneficiaryAddress,
// }) {
//   if (
//     !paymentId ||
//     !beneficiaryName ||
//     !retirementMessage ||
//     !beneficiaryAddress
//   ) {
//     throw {
//       status: 400,
//       message: "Faltan datos requeridos para crear la orden.",
//     };
//   }

//   const payment = await paymentModel.findById(paymentId).populate({
//     path: "userId",
//   });

//   if (!payment) {
//     throw { status: 404, message: "Pago no encontrado." };
//   }

//   if (payment.status !== "CONFIRMED") {
//     throw {
//       status: 400,
//       message:
//         "El estado del pago no es CONFIRMED. No se puede crear la orden.",
//     };
//   }

//   if (!payment.quote || !payment.quote.uuid) {
//     throw { status: 404, message: "Quote no encontrada." };
//   }

//   if (payment.order && payment.order.quote && payment.order.quote.uuid) {
//     return payment.order;
//   }

//   const payload = {
//     quote_uuid: payment.quote.uuid,
//     beneficiary_name: beneficiaryName,
//     retirement_message: retirementMessage,
//     consumption_metadata: consumptionMetadata,
//     beneficiary_address: beneficiaryAddress,
//   };

//   const orderResponse = await axiosInstance.post("orders", payload);
//   const orderData = orderResponse.data;

//   payment.order = orderData;
//   payment.status = "CONFIRMED";
//   await payment.save();

//   return orderData;
// }

// module.exports = {
//   createPDFDocument,
//   registerFonts,
//   formatDate,
//   drawImages,
//   drawHeader,
//   drawTonnes,
//   drawContent,
//   drawRetirementId,
//   drawRetirementDisclaimer,
//   drawProjectInfo,
//   drawFooter,
//   validateQuoteRequest,
//   getPaymentById,
//   requestQuote,
//   createOrderService,
// };
