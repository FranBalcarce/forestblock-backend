import firebaseAdmin from "./firebaseAdmin.js";
import qrcode from "qrcode";

import {
  formatDate,
  createPDFDocument,
  registerFonts,
  drawHeader,
  drawTonnes,
  drawContent,
  drawRetirementId,
  drawRetirementDisclaimer,
  drawFooter,
  drawImages,
  drawProjectInfo,
} from "../carbon/carbonServices.js";

const bucket = firebaseAdmin.storage().bucket();

async function drawQRCode(doc, url, x, y, size) {
  const dataUrl = await qrcode.toDataURL(url, { margin: 1 });
  const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  doc.image(buffer, x, y, { width: size, height: size });
}

export async function generateAndSavePdf({
  createdAt,
  beneficiaryName,
  quantityTonnes,
  retirementId,
  projectName,
  projectMethodology,
  projectMethodologyType,
  projectType,
  projectUrl,
}) {
  const fileName = `certificados/${retirementId}.pdf`;
  const file = bucket.file(fileName);

  const formattedDate = formatDate(createdAt);
  const doc = createPDFDocument();
  registerFonts(doc);

  const buffers = [];
  doc.on("data", (chunk) => buffers.push(chunk));

  const pdfBufferPromise = new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);
  });

  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const smallLogoPath = drawImages(doc);

  drawHeader(doc, formattedDate, pageW);
  drawTonnes(doc, quantityTonnes, pageW);
  drawContent(doc, beneficiaryName, pageW);
  drawRetirementId(doc, retirementId, pageW);
  drawRetirementDisclaimer(doc, pageW);
  drawProjectInfo(
    doc,
    pageW,
    projectName,
    projectMethodology,
    projectMethodologyType,
    projectType,
  );

  const qrSize = 80;
  const qrX = 60;
  const qrY = (pageH - qrSize) / 2;

  await drawQRCode(doc, projectUrl, qrX, qrY, qrSize);

  drawFooter(doc, pageW, pageH, smallLogoPath);

  doc.end();

  const pdfData = await pdfBufferPromise;

  await file.save(pdfData, {
    metadata: { contentType: "application/pdf" },
    public: true,
    resumable: false,
  });

  return `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`;
}

// const firebaseAdmin = require("./firebaseAdmin");
// const bucket = firebaseAdmin.storage().bucket();
// const qrcode = require("qrcode");

// const {
//   formatDate,
//   createPDFDocument,
//   registerFonts,
//   drawHeader,
//   drawTonnes,
//   drawContent,
//   drawRetirementId,
//   drawRetirementDisclaimer,
//   drawFooter,
//   drawImages,
//   drawProjectInfo
// } = require("../carbon/carbonServices");

// async function drawQRCode(doc, url, x, y, size) {
//   const dataUrl = await qrcode.toDataURL(url, { margin: 1 });
//   const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
//   const buffer = Buffer.from(base64Data, "base64");
//   doc.image(buffer, x, y, { width: size, height: size });
// }

// async function generateAndSavePdf({
//   createdAt,
//   beneficiaryName,
//   quantityTonnes,
//   retirementId,
//   projectName,
//   projectMethodology,
//   projectMethodologyType,
//   projectType,
//   projectUrl
// }) {
//   const fileName = `certificados/${retirementId}.pdf`;
//   const file = bucket.file(fileName);
//   const formattedDate = formatDate(createdAt);
//   const doc = createPDFDocument();
//   registerFonts(doc);

//   const buffers = [];
//   doc.on("data", (chunk) => buffers.push(chunk));

//   const pdfBufferPromise = new Promise((resolve, reject) => {
//     doc.on("end", () => resolve(Buffer.concat(buffers)));
//     doc.on("error", reject);
//   });

//   const pageW = doc.page.width;
//   const pageH = doc.page.height;
//   const smallLogoPath = drawImages(doc);

//   drawHeader(doc, formattedDate, pageW);
//   drawTonnes(doc, quantityTonnes, pageW);
//   drawContent(doc, beneficiaryName, pageW);
//   drawRetirementId(doc, retirementId, pageW);
//   drawRetirementDisclaimer(doc, pageW);
//   drawProjectInfo(doc, pageW, projectName, projectMethodology, projectMethodologyType, projectType);
//   const qrSize = 80;
//   const qrX = 60;
//   const qrY = (pageH - qrSize) / 2;
//   await drawQRCode(doc, projectUrl, qrX, qrY, qrSize);
//   drawFooter(doc, pageW, pageH, smallLogoPath);

//   doc.end();

//   const pdfData = await pdfBufferPromise;

//   await file.save(pdfData, {
//     metadata: { contentType: "application/pdf" },
//     public: true,
//     resumable: false,
//   });

//   const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`;
//   return publicUrl;
// }

// module.exports = { generateAndSavePdf };
