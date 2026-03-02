import express from "express";
import {
  getMarketplaceProjects,
  getListingByQuery,
  getListingById,
  getProjectById,
} from "./carbonController.js";

const router = express.Router();

/* Marketplace principal */
router.get("/marketplace", getMarketplaceProjects);

/**
 * ✅ Este es el que te está faltando y te genera el 404:
 * Front pega a: /api/carbon/listings?listingId=...
 */
router.get("/listings", getListingByQuery);

/* Listing individual alternativo (por param) */
router.get("/listing/:id", getListingById);

/* Proyecto individual (full + buyable listings) */
router.get("/project/:id", getProjectById);

export default router;

// import express from "express";
// import { getMarketplaceProjects, getListingById } from "./carbonController.js";

// const router = express.Router();

// /* Marketplace principal */
// router.get("/marketplace", getMarketplaceProjects);

// /* Listing individual (checkout) */
// router.get("/listing/:id", getListingById);

// export default router;
