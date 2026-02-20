// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

/* =========================================================
   MARKETPLACE - SUPPLY + INFO COMPLETA
========================================================= */

export const getMarketplaceProjects = async (req, res) => {
  try {
    console.log("🔥 MARKETPLACE CONTROLLER FINAL VERSION");

    /* =========================
       1️⃣ TRAER LISTINGS (supply real)
    ========================= */

    const listingsRes = await axios.get(`${CARBONMARK_BASE}/listings`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: { limit: 200 },
    });

    const listings = Array.isArray(listingsRes.data)
      ? listingsRes.data
      : listingsRes.data?.items || [];

    const availableListings = listings.filter(
      (l) => parseFloat(l.leftToSell) > 0,
    );

    if (!availableListings.length) {
      return res.json({ count: 0, items: [] });
    }

    /* =========================
       2️⃣ AGRUPAR POR PROJECT
    ========================= */

    const projectMap = {};

    for (const listing of availableListings) {
      const projectId = listing.project?.id;
      if (!projectId) continue;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          minPrice: Number(listing.singleUnitPrice),
          listings: [],
        };
      }

      projectMap[projectId].listings.push({
        ...listing,
        singleUnitPrice: Number(listing.singleUnitPrice),
        leftToSell: Number(listing.leftToSell),
      });

      const price = Number(listing.singleUnitPrice);
      if (!isNaN(price)) {
        projectMap[projectId].minPrice = Math.min(
          projectMap[projectId].minPrice,
          price,
        );
      }
    }

    const projectIds = Object.keys(projectMap);

    /* =========================
       3️⃣ TRAER INFO COMPLETA (imagenes, descripcion, geo)
    ========================= */

    const searchParams = new URLSearchParams();
    projectIds.forEach((id) => searchParams.append("keys", id));

    const projectsRes = await axios.get(
      `${CARBONMARK_BASE}/carbonProjects?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
        },
      },
    );

    const projects = projectsRes.data?.items || [];

    /* =========================
       4️⃣ MERGE FINAL
    ========================= */

    const marketplaceProjects = projects
      .filter((project) => projectMap[project.key]) // 🔥 clave
      .map((project) => {
        const supplyData = projectMap[project.key];

        return {
          ...project,
          minPrice: supplyData.minPrice,
          listings: supplyData.listings,
          hasSupply: true,
        };
      });

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("Marketplace error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Marketplace fetch failed" });
  }
};

/* =========================================================
   TRAER LISTING INDIVIDUAL (para checkout)
========================================================= */

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    const listingRes = await axios.get(`${CARBONMARK_BASE}/listings/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
    });

    return res.json(listingRes.data);
  } catch (err) {
    console.error("Listing fetch error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Listing fetch failed" });
  }
};

// // api/carbon/carbonController.js
// import axios from "axios";

// const CARBONMARK_BASE =
//   process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

// export const getMarketplaceProjects = async (req, res) => {
//   console.log("🔥 MARKETPLACE CONTROLLER (v18 listings)");

//   try {
//     const listingsRes = await axios.get(
//       `${CARBONMARK_BASE}/listings`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
//         },
//         params: {
//           limit: 200,
//         },
//       }
//     );

//     const listings = Array.isArray(listingsRes.data)
//       ? listingsRes.data
//       : listingsRes.data?.items || [];

//     if (!listings.length) {
//       return res.json({ count: 0, items: [] });
//     }

//     // ✅ Filtrar supply real
//     const availableListings = listings.filter(
//       (l) => Number(l.leftToSell) > 0
//     );

//     if (!availableListings.length) {
//       return res.json({ count: 0, items: [] });
//     }

//     // Agrupar por projectId
//     const projectMap = {};

//     for (const listing of availableListings) {
//       const project = listing.project;
//       if (!project?.id) continue;

//       const projectId = project.id;

//       if (!projectMap[projectId]) {
//         projectMap[projectId] = {
//           project,
//           minPrice: Number(listing.singleUnitPrice),
//           listings: [],
//         };
//       }

//       projectMap[projectId].listings.push({
//         ...listing,
//         leftToSell: Number(listing.leftToSell),
//         singleUnitPrice: Number(listing.singleUnitPrice),
//       });

//       const currentPrice = Number(listing.singleUnitPrice);

//       if (!isNaN(currentPrice)) {
//         projectMap[projectId].minPrice = Math.min(
//           projectMap[projectId].minPrice,
//           currentPrice
//         );
//       }
//     }

//     const marketplaceProjects = Object.values(projectMap).map((entry) => {
//       return {
//         ...entry.project,
//         key: entry.project.id, // importante para tu frontend
//         minPrice: entry.minPrice,
//         listings: entry.listings,
//         hasSupply: true,
//       };
//     });

//     return res.json({
//       count: marketplaceProjects.length,
//       items: marketplaceProjects,
//     });
//   } catch (err) {
//     console.error(
//       "Marketplace error:",
//       err.response?.data || err.message
//     );
//     return res.status(500).json({ error: "Marketplace fetch failed" });
//   }
// };
