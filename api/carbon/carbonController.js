// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE = "https://v18.api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  try {
    /* =====================================================
       1️⃣ TRAER PRICES CON SUPPLY
    ===================================================== */

    const pricesRes = await axios.get(`${CARBONMARK_BASE}/prices`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        limit: 10,
      },
    });

    // 🔥 En v18 prices es array directo
    const prices = Array.isArray(pricesRes.data)
      ? pricesRes.data
      : pricesRes.data?.items || [];

    console.log("FIRST PRICE OBJECT:");
    console.log(JSON.stringify(prices[0], null, 2));

    if (!prices.length) {
      return res.json({ count: 0, items: [] });
    }

    /* =====================================================
       2️⃣ AGRUPAR POR projectId (VCS-XXX)
    ===================================================== */

    const projectMap = {};

    for (const price of prices) {
      const projectId = price?.listing?.creditId?.projectId;
      const purchasePrice = Number(price?.purchasePrice);

      // Validaciones fuertes
      if (!projectId) continue;
      if (!Number.isFinite(purchasePrice)) continue;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          key: projectId,
          minPrice: purchasePrice,
          listings: [],
        };
      }

      projectMap[projectId].listings.push(price);

      projectMap[projectId].minPrice = Math.min(
        projectMap[projectId].minPrice,
        purchasePrice,
      );
    }

    const projectKeys = Object.keys(projectMap);

    console.log("PROJECT IDS FROM PRICES:", projectKeys.slice(0, 10));

    if (!projectKeys.length) {
      return res.json({ count: 0, items: [] });
    }

    /* =====================================================
       3️⃣ TRAER PROYECTOS POR KEYS
    ===================================================== */

    const projectsRes = await axios.get(`${CARBONMARK_BASE}/carbonProjects`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        keys: projectKeys.join(","),
      },
    });

    const projects = projectsRes.data?.items || [];

    console.log(
      "PROJECT KEYS FROM carbonProjects:",
      projects.slice(0, 10).map((p) => p.key),
    );

    if (!projects.length) {
      return res.json({ count: 0, items: [] });
    }

    /* =====================================================
       4️⃣ MERGE PROJECT + PRICE
    ===================================================== */

    const marketplaceProjects = projects
      .filter((project) => projectMap[project.key]) // solo los que tienen supply
      .map((project) => ({
        ...project,
        minPrice: projectMap[project.key].minPrice,
        listings: projectMap[project.key].listings,
        hasSupply: true,
      }));

    console.log("FINAL PROJECTS COUNT:", marketplaceProjects.length);

    /* =====================================================
       5️⃣ RESPUESTA FINAL
    ===================================================== */

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("❌ Marketplace error:", err.response?.data || err);
    return res.status(500).json({ error: "Marketplace fetch failed" });
  }
};
