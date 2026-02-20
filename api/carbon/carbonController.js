import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  try {
    console.log("🔥 MARKETPLACE STABLE VERSION");

    /* =========================
       1️⃣ LISTINGS (SUPPLY REAL)
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
       2️⃣ AGRUPAR POR PROJECT KEY
    ========================= */

    const projectMap = {};

    for (const listing of availableListings) {
      const key = listing.project?.key;
      if (!key) continue;

      if (!projectMap[key]) {
        projectMap[key] = {
          minPrice: Number(listing.singleUnitPrice),
          listings: [],
        };
      }

      projectMap[key].listings.push({
        ...listing,
        singleUnitPrice: Number(listing.singleUnitPrice),
        leftToSell: Number(listing.leftToSell),
      });

      const price = Number(listing.singleUnitPrice);
      if (!isNaN(price)) {
        projectMap[key].minPrice = Math.min(projectMap[key].minPrice, price);
      }
    }

    const keys = Object.keys(projectMap);

    if (!keys.length) {
      return res.json({ count: 0, items: [] });
    }

    /* =========================
       3️⃣ INFO COMPLETA
    ========================= */

    const searchParams = new URLSearchParams();
    keys.forEach((k) => searchParams.append("keys", k));

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
       4️⃣ MERGE SEGURO
    ========================= */

    const marketplaceProjects = projects
      .map((project) => {
        const supplyData = projectMap[project.key];

        if (!supplyData) return null;

        return {
          ...project,
          key: project.key,
          minPrice: supplyData.minPrice,
          listings: supplyData.listings,
          hasSupply: true,
        };
      })
      .filter(Boolean);

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("Marketplace error:", err.message);
    return res.status(500).json({ error: "Marketplace fetch failed" });
  }
};

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
    console.error("Listing fetch error:", err.message);
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
