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

    const prices = Array.isArray(pricesRes.data)
      ? pricesRes.data
      : pricesRes.data?.items || [];

    if (!prices.length) {
      return res.json({ count: 0, items: [] });
    }

    const projectMap = {};

    for (const price of prices) {
      // ✅ CORRECCIÓN REAL
      const projectId = price?.token?.projectId;

      if (!projectId) continue;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          minPrice: price.price ?? price.purchasePrice ?? null,
          listings: [],
        };
      }

      projectMap[projectId].listings.push(price);

      const currentPrice = price.price ?? price.purchasePrice;

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

    const searchParams = new URLSearchParams();
    for (const k of projectKeys) {
      searchParams.append("keys", k);
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
    console.error(
      "Marketplace error:",
      err?.response?.status,
      err?.response?.data || err?.message || err,
    );
    return res.status(500).json({ error: "Marketplace fetch failed" });
  }
};
