// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  console.log("🔥 MARKETPLACE CONTROLLER EXECUTING");

  try {
    const pricesRes = await axios.get(`${CARBONMARK_BASE}/prices`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        limit: 200,
      },
    });

    const prices = Array.isArray(pricesRes.data)
      ? pricesRes.data
      : pricesRes.data?.items || [];

    if (!prices.length) {
      return res.json({ count: 0, items: [] });
    }

    // ✅ Filtrar supply real
    const availablePrices = prices.filter(
      (p) => Number(p.supply) > 0 || Number(p.liquidSupply) > 0,
    );

    if (!availablePrices.length) {
      return res.json({ count: 0, items: [] });
    }

    // Agrupar por projectId
    const projectMap = {};

    for (const price of availablePrices) {
      const projectId = price.projectId || price?.token?.projectId;
      if (!projectId) continue;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          minPrice: price.purchasePrice ?? price.baseUnitPrice ?? null,
          listings: [],
        };
      }

      projectMap[projectId].listings.push(price);

      const currentPrice = price.purchasePrice ?? price.baseUnitPrice;

      if (currentPrice) {
        projectMap[projectId].minPrice =
          projectMap[projectId].minPrice === null
            ? currentPrice
            : Math.min(projectMap[projectId].minPrice, currentPrice);
      }
    }

    const projectKeys = Object.keys(projectMap);

    if (!projectKeys.length) {
      return res.json({ count: 0, items: [] });
    }

    // Serializar keys correctamente
    const searchParams = new URLSearchParams();
    for (const key of projectKeys) {
      searchParams.append("keys", key);
    }

    const projectsRes = await axios.get(
      `${CARBONMARK_BASE}/carbonProjects?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
        },
      },
    );

    const projects = projectsRes.data?.items || [];

    const marketplaceProjects = projects.map((project) => {
      const map = projectMap[project.key];

      return {
        ...project,
        minPrice: map?.minPrice ?? null,
        listings: map?.listings ?? [],
        hasSupply: Boolean(map),
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
