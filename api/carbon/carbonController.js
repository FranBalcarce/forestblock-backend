import axios from "axios";

const CARBONMARK_BASE = "https://v18.api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  try {
    // =========================
    // 1️⃣ Traer listings (/prices)
    // =========================
    const pricesRes = await axios.get(`${CARBONMARK_BASE}/prices`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: {
        minSupply: 1,
        limit: 200,
      },
    });

    // v18 devuelve array directo
    const prices = Array.isArray(pricesRes.data)
      ? pricesRes.data
      : pricesRes.data?.items || [];

    if (!prices.length) {
      return res.json({ count: 0, items: [] });
    }

    // =========================
    // 2️⃣ Agrupar por projectKey
    // =========================
    const projectMap = {};

    for (const price of prices) {
      // En v18 puede venir como projectKey o projectId
      const projectKey =
        price?.projectKey || price?.projectId || price?.project?.key;

      if (!projectKey) continue;

      if (!projectMap[projectKey]) {
        projectMap[projectKey] = {
          minPrice: price.price ?? price.purchasePrice ?? null,
          listings: [],
        };
      }

      projectMap[projectKey].listings.push(price);

      const currentPrice = price.price ?? price.purchasePrice ?? null;

      if (currentPrice !== null) {
        projectMap[projectKey].minPrice =
          projectMap[projectKey].minPrice === null
            ? currentPrice
            : Math.min(projectMap[projectKey].minPrice, currentPrice);
      }
    }

    const projectKeys = Object.keys(projectMap);

    if (!projectKeys.length) {
      return res.json({ count: 0, items: [] });
    }

    // =========================
    // 3️⃣ Traer carbonProjects
    // =========================
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

    if (!projects.length) {
      return res.json({ count: 0, items: [] });
    }

    // =========================
    // 4️⃣ Cruzar projects + prices
    // =========================
    const marketplaceProjects = projects.map((project) => {
      const key = project?.key;
      const map = key ? projectMap[key] : null;

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
