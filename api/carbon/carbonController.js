// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE = "https://v18.api.carbonmark.com";
console.log("API KEY:", process.env.CARBONMARK_API_KEY);
console.log("PRICES RAW:", JSON.stringify(pricesRes.data, null, 2));

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

    const prices = pricesRes.data?.items || [];

    console.log("TOTAL PRICES:", prices.length);

    if (!prices.length) {
      return res.json({ count: 0, items: [] });
    }

    const projectMap = {};

    for (const price of prices) {
      const projectId = price?.listing?.credit?.projectId;

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

    console.log("PROJECT IDS:", projectKeys);

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

    const marketplaceProjects = projects.map((project) => ({
      ...project,
      minPrice: projectMap[project.key]?.minPrice ?? null,
      listings: projectMap[project.key]?.listings ?? [],
      hasSupply: Boolean(projectMap[project.key]),
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
