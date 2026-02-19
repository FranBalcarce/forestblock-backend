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

    // v18 /prices devuelve array directo
    const prices = Array.isArray(pricesRes.data)
      ? pricesRes.data
      : pricesRes.data?.items || [];

    console.log("[marketplace] prices:", prices.length);

    if (!prices.length) {
      return res.json({ count: 0, items: [] });
    }

    // Agrupar por projectId (VCS-xxx)
    const projectMap = {};

    for (const price of prices) {
      const projectId = price?.projectId;

      if (!projectId) continue;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          minPrice: price.price ?? price.purchasePrice ?? null,
          listings: [],
        };
      }

      projectMap[projectId].listings.push(price);

      if (price.price) {
        projectMap[projectId].minPrice =
          projectMap[projectId].minPrice === null
            ? price.price
            : Math.min(projectMap[projectId].minPrice, price.price);
      }
    }

    const projectKeys = Object.keys(projectMap);
    console.log("[marketplace] unique projectIds:", projectKeys.length);
    console.log("[marketplace] sample:", projectKeys.slice(0, 10));

    if (!projectKeys.length) {
      return res.json({ count: 0, items: [] });
    }

    // ✅ IMPORTANTE: serializar keys repetido (keys=...&keys=...)
    const searchParams = new URLSearchParams();
    for (const k of projectKeys) searchParams.append("keys", k);

    const projectsRes = await axios.get(
      `${CARBONMARK_BASE}/carbonProjects?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
        },
      },
    );

    const projects = projectsRes.data?.items || [];
    console.log("[marketplace] carbonProjects returned:", projects.length);

    if (!projects.length) {
      // si acá te da 0, el problema era 100% el query de keys
      return res.json({ count: 0, items: [] });
    }

    const marketplaceProjects = projects.map((project) => {
      // project.key suele ser "VCS-844"
      const key = project?.key;
      const map = key ? projectMap[key] : null;

      return {
        ...project,
        minPrice: map?.minPrice ?? null,
        listings: map?.listings ?? [],
        hasSupply: Boolean(map),
      };
    });

    const available = marketplaceProjects.filter((p) => p.hasSupply).length;
    console.log("[marketplace] matched with supply:", available);

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
