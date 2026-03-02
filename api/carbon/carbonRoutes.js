import express from "express";
import {
  getMarketplaceProjects,
  getMarketplaceProjectByKey,
  getListingById,
  getListingByQuery,
} from "./carbonController.js";

const router = express.Router();

/* Marketplace principal */
router.get("/marketplace", getMarketplaceProjects);

/* ✅ Detalle de proyecto - aliases para no romper el frontend */
router.get("/marketplace/:key", getMarketplaceProjectByKey);
router.get("/project/:key", getMarketplaceProjectByKey);
router.get("/projects/:key", getMarketplaceProjectByKey);

/* ✅ Listing para checkout */
router.get("/listing/:id", getListingById);

/* ✅ Alias por si el frontend usa plural con params */
router.get("/listings/:id", getListingById);

/* ✅ CLAVE: si el frontend usa query param ?listingId=... */
router.get("/listings", getListingByQuery);

export default router;

// import express from "express";
// import { getMarketplaceProjects, getListingById } from "./carbonController.js";

// const router = express.Router();

// /* Marketplace principal */
// router.get("/marketplace", getMarketplaceProjects);

// /* Listing individual (checkout) */
// router.get("/listing/:id", getListingById);

// export default router;
