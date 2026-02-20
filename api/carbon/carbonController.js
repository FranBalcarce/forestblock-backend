import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

/* ============================================================
   1️⃣ MARKETPLACE - trae proyectos con listings activos
============================================================ */
export const getMarketplaceProjects = async (req, res) => {
  try {
    // Traer listings (supply real)
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

    // Agrupar projectIds únicos
    const projectIds = [
      ...new Set(availableListings.map((l) => l.project?.id).filter(Boolean)),
    ];

    // Traer proyectos completos (imagen, descripción, geo)
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

    // Construir respuesta final
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

/* ============================================================
   2️⃣ LISTING BY ID - para retireCheckout
============================================================ */
export const getListingById = async (req, res) => {
  const { listingId } = req.query;

  if (!listingId) {
    return res.status(400).json({ error: "listingId is required" });
  }

  try {
    const response = await axios.get(`${CARBONMARK_BASE}/listings`, {
      headers: {
        Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
      },
      params: { limit: 200 },
    });

    const listings = Array.isArray(response.data)
      ? response.data
      : response.data?.items || [];

    const found = listings.find((l) => l.id === listingId);

    if (!found) {
      return res.status(404).json({ error: "Listing not found" });
    }

    return res.json(found);
  } catch (err) {
    console.error("Listing fetch error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch listing" });
  }
};
