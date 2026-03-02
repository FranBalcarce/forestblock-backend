// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

const authHeaders = () => ({
  Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
});

/**
 * Intenta traer info completa del proyecto desde /carbonProjects
 * Si falla, devuelve null (para NO romper marketplace)
 */
const fetchFullProjectsByKeys = async (keys = []) => {
  if (!keys.length) return [];

  const searchParams = new URLSearchParams();
  keys.forEach((k) => searchParams.append("keys", k));

  const url = `${CARBONMARK_BASE}/carbonProjects?${searchParams.toString()}`;

  const res = await axios.get(url, { headers: authHeaders() });

  const items = Array.isArray(res.data) ? res.data : res.data?.items || [];

  return items;
};

/* ==============================
   MARKETPLACE PROJECTS (LIST)
============================== */

export const getMarketplaceProjects = async (req, res) => {
  console.log("🔥 MARKETPLACE CONTROLLER (SAFE ENRICHED) - LIST");

  try {
    const listingsRes = await axios.get(`${CARBONMARK_BASE}/listings`, {
      headers: authHeaders(),
      params: { limit: 200 },
    });

    const listings = Array.isArray(listingsRes.data)
      ? listingsRes.data
      : listingsRes.data?.items || [];

    console.log("📦 TOTAL LISTINGS:", listings.length);

    // ✅ Filtrar supply real
    const availableListings = listings.filter((l) => Number(l.leftToSell) > 0);
    console.log(
      "🟢 AVAILABLE LISTINGS (leftToSell > 0):",
      availableListings.length,
    );

    if (!availableListings.length) {
      return res.json({ count: 0, items: [] });
    }

    // Agrupar por projectId
    const projectMap = {};

    for (const listing of availableListings) {
      const project = listing.project;
      if (!project?.id) continue;

      const projectId = project.id;

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          baseProject: project, // lo que ya venía funcionando (desde listings)
          minPrice: Number(listing.singleUnitPrice),
          listings: [],
        };
      }

      projectMap[projectId].listings.push({
        ...listing,
        leftToSell: Number(listing.leftToSell),
        singleUnitPrice: Number(listing.singleUnitPrice),
      });

      const currentPrice = Number(listing.singleUnitPrice);
      if (!Number.isNaN(currentPrice)) {
        projectMap[projectId].minPrice = Math.min(
          projectMap[projectId].minPrice,
          currentPrice,
        );
      }
    }

    const projectIds = Object.keys(projectMap);
    console.log("🧩 PROJECTS WITH SUPPLY:", projectIds.length);

    // 🔥 Enriquecer SIN ROMPER (si falla, seguimos con baseProject)
    let fullProjectMap = {};
    try {
      const fullProjects = await fetchFullProjectsByKeys(projectIds);
      console.log("🧠 FULL PROJECTS FOUND:", fullProjects.length);

      fullProjectMap = fullProjects.reduce((acc, p) => {
        if (p?.id) acc[p.id] = p;
        return acc;
      }, {});
    } catch (e) {
      console.log("⚠️ ENRICH FAILED, FALLBACK TO BASE PROJECTS:", e?.message);
      fullProjectMap = {};
    }

    const marketplaceProjects = projectIds.map((projectId) => {
      const entry = projectMap[projectId];
      const fullInfo = fullProjectMap[projectId];

      return {
        ...(fullInfo || entry.baseProject),
        key: projectId, // importante para el frontend
        minPrice: entry.minPrice,
        listings: entry.listings,
        hasSupply: true,
      };
    });

    console.log("✅ FINAL PROJECT COUNT:", marketplaceProjects.length);

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("Marketplace error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Marketplace fetch failed" });
  }
};

/* ==============================
   MARKETPLACE PROJECT (DETAIL)
   /api/carbon/marketplace/:key
============================== */

export const getMarketplaceProjectByKey = async (req, res) => {
  const { key } = req.params;

  console.log("🔎 MARKETPLACE PROJECT DETAIL:", key);

  try {
    // 1) Traemos listings (para asegurar que sea comprable/supply y precio)
    const listingsRes = await axios.get(`${CARBONMARK_BASE}/listings`, {
      headers: authHeaders(),
      params: { limit: 200 },
    });

    const listings = Array.isArray(listingsRes.data)
      ? listingsRes.data
      : listingsRes.data?.items || [];

    // Filtrar: supply > 0 y project.id == key
    const matched = listings.filter(
      (l) => Number(l.leftToSell) > 0 && l?.project?.id === key,
    );

    console.log("🟢 MATCHED LISTINGS:", matched.length);

    if (!matched.length) {
      return res.status(404).json({ error: "Project not found or no supply" });
    }

    // Base project desde listing (fallback)
    const baseProject = matched[0].project;

    // 2) Calculamos minPrice y armamos listings parseadas
    let minPrice = null;

    const parsedListings = matched.map((l) => {
      const price = Number(l.singleUnitPrice);
      if (Number.isFinite(price)) {
        minPrice = minPrice === null ? price : Math.min(minPrice, price);
      }

      return {
        ...l,
        leftToSell: Number(l.leftToSell),
        singleUnitPrice: Number(l.singleUnitPrice),
      };
    });

    // 3) Enriquecemos info completa del proyecto (mapa, descripción, imágenes, etc)
    let fullInfo = null;
    try {
      const fullProjects = await fetchFullProjectsByKeys([key]);
      fullInfo = fullProjects?.[0] || null;
      console.log("🧠 FULL INFO:", fullInfo ? "YES" : "NO");
    } catch (e) {
      console.log("⚠️ DETAIL ENRICH FAILED, FALLBACK:", e?.message);
      fullInfo = null;
    }

    return res.json({
      ...(fullInfo || baseProject),
      key,
      minPrice: minPrice ?? 0,
      listings: parsedListings,
      hasSupply: true,
    });
  } catch (err) {
    console.error("Project detail error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Project detail fetch failed" });
  }
};

/* ==============================
   GET SINGLE LISTING (CHECKOUT)
   /api/carbon/listing/:id   (alias /listings/:id)
============================== */

export const getListingById = async (req, res) => {
  const { id } = req.params;
  console.log("🧾 GET LISTING BY ID:", id);

  try {
    const listingRes = await axios.get(`${CARBONMARK_BASE}/listings/${id}`, {
      headers: authHeaders(),
    });

    return res.json(listingRes.data);
  } catch (err) {
    console.error("Listing fetch error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Listing fetch failed" });
  }
};

// // api/carbon/carbonController.js
// import axios from "axios";

// const CARBONMARK_BASE =
//   process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

// /* ==============================
//    MARKETPLACE PROJECTS
// ============================== */

// export const getMarketplaceProjects = async (req, res) => {
//   console.log("🔥 MARKETPLACE CONTROLLER (SAFE ENRICHED)");

//   try {
//     const listingsRes = await axios.get(`${CARBONMARK_BASE}/listings`, {
//       headers: {
//         Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
//       },
//       params: { limit: 200 },
//     });

//     const listings = Array.isArray(listingsRes.data)
//       ? listingsRes.data
//       : listingsRes.data?.items || [];

//     const availableListings = listings.filter((l) => Number(l.leftToSell) > 0);

//     if (!availableListings.length) {
//       return res.json({ count: 0, items: [] });
//     }

//     const projectMap = {};

//     for (const listing of availableListings) {
//       const project = listing.project;
//       if (!project?.id) continue;

//       const projectId = project.id;

//       if (!projectMap[projectId]) {
//         projectMap[projectId] = {
//           baseProject: project,
//           minPrice: Number(listing.singleUnitPrice),
//           listings: [],
//         };
//       }

//       projectMap[projectId].listings.push({
//         ...listing,
//         leftToSell: Number(listing.leftToSell),
//         singleUnitPrice: Number(listing.singleUnitPrice),
//       });

//       const currentPrice = Number(listing.singleUnitPrice);

//       if (!isNaN(currentPrice)) {
//         projectMap[projectId].minPrice = Math.min(
//           projectMap[projectId].minPrice,
//           currentPrice,
//         );
//       }
//     }

//     const projectIds = Object.keys(projectMap);

//     /* ==============================
//        ENRICH PROJECT INFO
//     ============================== */

//     const searchParams = new URLSearchParams();
//     projectIds.forEach((id) => searchParams.append("keys", id));

//     const projectsRes = await axios.get(
//       `${CARBONMARK_BASE}/carbonProjects?${searchParams.toString()}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
//         },
//       },
//     );

//     const fullProjects = projectsRes.data?.items || [];

//     const fullProjectMap = {};
//     for (const proj of fullProjects) {
//       fullProjectMap[proj.id] = proj;
//     }

//     const marketplaceProjects = projectIds.map((projectId) => {
//       const entry = projectMap[projectId];
//       const fullInfo = fullProjectMap[projectId];

//       return {
//         ...(fullInfo || entry.baseProject),
//         key: projectId,
//         minPrice: entry.minPrice,
//         listings: entry.listings,
//         hasSupply: true,
//       };
//     });

//     return res.json({
//       count: marketplaceProjects.length,
//       items: marketplaceProjects,
//     });
//   } catch (err) {
//     console.error("Marketplace error:", err.response?.data || err.message);
//     return res.status(500).json({ error: "Marketplace fetch failed" });
//   }
// };

// /* ==============================
//    GET SINGLE LISTING (CHECKOUT)
// ============================== */

// export const getListingById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const listingRes = await axios.get(`${CARBONMARK_BASE}/listings/${id}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
//       },
//     });

//     return res.json(listingRes.data);
//   } catch (err) {
//     console.error("Listing fetch error:", err.message);
//     return res.status(500).json({ error: "Listing fetch failed" });
//   }
// };
