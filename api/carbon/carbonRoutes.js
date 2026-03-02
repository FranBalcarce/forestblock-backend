import express from "express";
import {
  getMarketplaceProjects,
  getMarketplaceProjectByKey,
  getListingById,
} from "./carbonController.js";

const router = express.Router();

/* Marketplace principal */
router.get("/marketplace", getMarketplaceProjects);

/* Detalle de proyecto (para /marketplace/:id del frontend) */
router.get("/marketplace/:key", getMarketplaceProjectByKey);

/* Listing individual (checkout) */
router.get("/listing/:id", getListingById);

/* ✅ Alias por si el frontend pega a /listings/:id */
router.get("/listings/:id", getListingById);

export default router;

// import express from "express";
// import { getMarketplaceProjects, getListingById } from "./carbonController.js";

// const router = express.Router();

// /* Marketplace principal */
// router.get("/marketplace", getMarketplaceProjects);

// /* Listing individual (checkout) */
// router.get("/listing/:id", getListingById);

// export default router;
