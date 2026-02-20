// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

export const getMarketplaceProjects = async (req, res) => {
  try {
    // 1️⃣ Traer listings (supply real)
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

    // 2️⃣ Agrupar projectIds
    const projectIds = [
      ...new Set(availableListings.map((l) => l.project?.id).filter(Boolean)),
    ];

    // 3️⃣ Traer proyectos completos (imagen + descripción + geo)
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

    const projects = projectsRes.data?.items || [];

    // 4️⃣ Construir respuesta final
    const marketplaceProjects = projects.map((project) => {
      const relatedListings = availableListings.filter(
        (l) => l.project?.id === project.key,
      );

      const minPrice = Math.min(
        ...relatedListings.map((l) => Number(l.singleUnitPrice)),
      );

      return {
        ...project,
        key: project.key,
        minPrice,
        listings: relatedListings,
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
