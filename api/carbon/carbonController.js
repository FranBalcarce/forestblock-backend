// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  console.log("🔥 MARKETPLACE CONTROLLER (SAFE ENRICHED)");

  try {
    const listingsRes = await axios.get(`${CARBONMARK_BASE}/listings`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: { limit: 200 },
    });

    const listings = Array.isArray(listingsRes.data)
      ? listingsRes.data
      : listingsRes.data?.items || [];

    const availableListings = listings.filter((l) => Number(l.leftToSell) > 0);

    if (!availableListings.length) {
      return res.json({ count: 0, items: [] });
    }

    const projectMap = {};

    for (const listing of availableListings) {
      const project = listing.project;
      if (!project?.id) continue;

      const projectId = project.id;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          baseProject: project, // lo que ya funciona
          minPrice: Number(listing.singleUnitPrice),
          listings: [],
        };
      }

      projectMap[projectId].listings.push({
        ...listing,
        leftToSell: Number(listing.leftToSell),
        singleUnitPrice: Number(listing.singleUnitPrice),
      });

      const currentPrice = Number(listing.singleUnitPrice);

      if (!isNaN(currentPrice)) {
        projectMap[projectId].minPrice = Math.min(
          projectMap[projectId].minPrice,
          currentPrice,
        );
      }
    }

    const projectIds = Object.keys(projectMap);

    // 🔥 ENRIQUECER INFO COMPLETA SIN ROMPER NADA
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

    const fullProjects = projectsRes.data?.items || [];

    const fullProjectMap = {};
    for (const proj of fullProjects) {
      fullProjectMap[proj.id] = proj;
    }

    const marketplaceProjects = projectIds.map((projectId) => {
      const entry = projectMap[projectId];
      const fullInfo = fullProjectMap[projectId];

      return {
        ...(fullInfo || entry.baseProject), // 🔥 si existe full info la usamos
        key: projectId,
        minPrice: entry.minPrice,
        listings: entry.listings,
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
