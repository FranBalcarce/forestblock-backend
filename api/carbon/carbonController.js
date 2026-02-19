// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE = "https://v18.api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  try {
    const pricesRes = await axios.get(`${CARBONMARK_BASE}/prices`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        minSupply: 1,
        limit: 200,
      },
    });

    const prices = pricesRes.data || [];

    // 🔥 Agrupar por projectId correcto (v18)
    const projectMap = {};

    for (const price of prices) {
      const projectId = price?.listing?.creditId?.projectId;

      if (!projectId) continue;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          minPrice: price.purchasePrice,
          listings: [],
        };
      }

      projectMap[projectId].listings.push(price);

      projectMap[projectId].minPrice = Math.min(
        projectMap[projectId].minPrice,
        price.purchasePrice,
      );
    }

    const projectKeys = Object.keys(projectMap);

    if (!projectKeys.length) {
      return res.json({ count: 0, items: [] });
    }

    const projectsRes = await axios.get(`${CARBONMARK_BASE}/carbonProjects`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        keys: projectKeys.join(","),
      },
    });

    const projects = projectsRes.data?.items || [];

    // 🔥 SOLO devolver proyectos que tengan supply
    const marketplaceProjects = projects
      .filter((project) => projectMap[project.key])
      .map((project) => ({
        ...project,
        minPrice: projectMap[project.key].minPrice,
        listings: projectMap[project.key].listings,
        hasSupply: true,
      }));

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("Marketplace error:", err.response?.data || err);
    res.status(500).json({ error: "Marketplace fetch failed" });
  }
};

// // api/carbon/carbonController.js
// import axios from "axios";

// const CARBONMARK_BASE = "https://v18.api.carbonmark.com";

// export const getMarketplaceProjects = async (req, res) => {
//   try {
//     // 1️⃣ Traer prices con supply
//     const pricesRes = await axios.get(`${CARBONMARK_BASE}/prices`, {
//       headers: {
//         Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
//       },
//       params: {
//         minSupply: 1,
//       },
//     });

//     const prices = Array.isArray(pricesRes.data)
//       ? pricesRes.data
//       : pricesRes.data?.items || [];
//     console.log("=== DEBUG PRICES ===");
//     console.log("TOTAL PRICES:", prices.length);
//     console.log("FIRST PRICE SAMPLE:", prices[0]);
//     console.log("====================");
//     if (!prices.length) {
//       return res.json({ count: 0, items: [] });
//     }

//     // 2️⃣ Agrupar por projectId REAL (v18)
//     const projectMap = {};

//     for (const price of prices) {
//       const projectKey = price?.listing?.creditId?.projectId;

//       if (!projectKey) continue;

//       if (!projectMap[projectKey]) {
//         projectMap[projectKey] = {
//           key: projectKey,
//           minPrice: price.purchasePrice,
//           listings: [],
//         };
//       }

//       projectMap[projectKey].listings.push(price);

//       projectMap[projectKey].minPrice = Math.min(
//         projectMap[projectKey].minPrice,
//         price.purchasePrice,
//       );
//     }

//     const projectKeys = Object.keys(projectMap);

//     if (!projectKeys.length) {
//       return res.json({ count: 0, items: [] });
//     }

//     // 3️⃣ Traer proyectos usando keys (v18 correcto)
//     const projectsRes = await axios.get(`${CARBONMARK_BASE}/carbonProjects`, {
//       headers: {
//         Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
//       },
//       params: {
//         keys: projectKeys.join(","),
//       },
//     });

//     const projects = projectsRes.data?.items || [];

//     // 4️⃣ Merge limpio
//     const marketplaceProjects = projects.map((project) => ({
//       ...project,
//       minPrice: projectMap[project.key]?.minPrice ?? null,
//       listings: projectMap[project.key]?.listings ?? [],
//       hasSupply: true,
//     }));

//     return res.json({
//       count: marketplaceProjects.length,
//       items: marketplaceProjects,
//     });
//   } catch (err) {
//     console.error("❌ Marketplace error:", err.response?.data || err);
//     res.status(500).json({ error: "Marketplace fetch failed" });
//   }
// };
