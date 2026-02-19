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

    console.log("TOTAL PRICES:", prices.length);

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

    console.log("PROJECT IDS FROM PRICES:");
    console.log(projectKeys.slice(0, 10));

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

    console.log("PROJECT KEYS FROM carbonProjects:");
    console.log(projects.slice(0, 10).map((p) => p.key));

    const marketplaceProjects = projects.map((project) => ({
      ...project,
      minPrice: projectMap[project.key]?.minPrice ?? null,
      listings: projectMap[project.key]?.listings ?? [],
      hasSupply: Boolean(projectMap[project.key]),
    }));

    console.log(
      "MATCHED PROJECTS COUNT:",
      marketplaceProjects.filter((p) => p.hasSupply).length,
    );

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("Marketplace error:", err.response?.data || err);
    res.status(500).json({ error: "Marketplace fetch failed" });
  }
};
