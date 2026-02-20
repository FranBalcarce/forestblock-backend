// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  console.log("🔥 MARKETPLACE CONTROLLER (v18 listings)");
  console.log("BASE URL:", CARBONMARK_BASE);
  console.log("API KEY PRESENT:", Boolean(process.env.CARBONMARK_API_KEY));

  try {
    const listingsRes = await axios.get(`${CARBONMARK_BASE}/listings`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        limit: 200,
      },
    });

    const listings = Array.isArray(listingsRes.data)
      ? listingsRes.data
      : listingsRes.data?.items || [];

    console.log("📦 TOTAL LISTINGS:", listings.length);

    if (!listings.length) {
      console.log("⚠️ No listings returned from API");
      return res.json({ count: 0, items: [] });
    }

    // Debug first listing structure
    console.log("🔎 SAMPLE LISTING:", listings[0]);

    // ✅ Filtrar supply real (más seguro)
    const availableListings = listings.filter((l) => {
      const left = parseFloat(l.leftToSell);
      return !isNaN(left) && left > 0;
    });

    console.log(
      "🟢 AVAILABLE LISTINGS (leftToSell > 0):",
      availableListings.length,
    );

    if (!availableListings.length) {
      console.log("⚠️ Listings exist but none have supply");
      return res.json({ count: 0, items: [] });
    }

    // Agrupar por projectId
    const projectMap = {};

    for (const listing of availableListings) {
      const project = listing.project;

      if (!project?.id) {
        console.log("❌ Listing without project id:", listing.id);
        continue;
      }

      const projectId = project.id;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          project,
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

    console.log("📊 PROJECTS WITH SUPPLY:", Object.keys(projectMap).length);

    const marketplaceProjects = Object.values(projectMap).map((entry) => {
      return {
        ...entry.project,
        key: entry.project.id,
        minPrice: entry.minPrice,
        listings: entry.listings,
        hasSupply: true,
      };
    });

    console.log("✅ FINAL PROJECT COUNT:", marketplaceProjects.length);

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("💥 Marketplace error:");
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);

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
