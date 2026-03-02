// api/carbon/carbonController.js
import axios from "axios";

const CARBONMARK_BASE =
  process.env.CARBONMARK_BASE_URL || "https://v18.api.carbonmark.com";

const authHeaders = () => ({
  Authorization: `Bearer ${process.env.CARBONMARK_API_KEY}`,
});

const axiosCM = axios.create({
  baseURL: CARBONMARK_BASE,
  timeout: 20000,
});

const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/**
 * Trae proyectos completos (carbonProjects) por keys.
 * OJO: el "key" que usa carbonProjects a veces viene como `key`,
 * y en tu marketplace vos usás `listing.project.id` como identificador.
 * Por eso hacemos un map flexible por key/id/projectID.
 */
const fetchFullProjectsByKeys = async (keys) => {
  if (!keys?.length) return new Map();

  const map = new Map();

  // Para no romper por URL demasiado larga
  const batches = chunk(keys, 50);

  for (const batch of batches) {
    const searchParams = new URLSearchParams();
    batch.forEach((k) => searchParams.append("keys", k));

    const res = await axiosCM.get(
      `/carbonProjects?${searchParams.toString()}`,
      {
        headers: authHeaders(),
      },
    );

    const items = res.data?.items || [];
    for (const p of items) {
      const k = p?.key ?? p?.id ?? p?.projectID ?? p?.projectId;
      if (k) map.set(String(k), p);
    }
  }

  return map;
};

/* ==============================
   MARKETPLACE PROJECTS
   - Mantiene la lógica que TE FUNCIONA (listings con leftToSell>0)
   - Enriquecer con carbonProjects SIN romper
============================== */
export const getMarketplaceProjects = async (req, res) => {
  console.log("🔥 MARKETPLACE CONTROLLER (LISTINGS -> ENRICH)");

  try {
    console.log("BASE URL:", CARBONMARK_BASE);
    console.log("API KEY PRESENT:", Boolean(process.env.CARBONMARK_API_KEY));

    const listingsRes = await axiosCM.get(`/listings`, {
      headers: authHeaders(),
      params: { limit: 200 },
    });

    const listings = Array.isArray(listingsRes.data)
      ? listingsRes.data
      : listingsRes.data?.items || [];

    console.log("📦 TOTAL LISTINGS:", listings.length);

    // ✅ Sólo los que realmente tienen supply
    const availableListings = listings.filter(
      (l) => safeNumber(l.leftToSell) > 0,
    );
    console.log(
      "🟢 AVAILABLE LISTINGS (leftToSell>0):",
      availableListings.length,
    );

    if (!availableListings.length) {
      return res.json({ count: 0, items: [] });
    }

    // Agrupar por projectId (el que venía funcionando)
    const projectMap = {}; // { [projectId]: { baseProject, minPrice, listings[] } }

    for (const listing of availableListings) {
      const project = listing.project;
      if (!project?.id) continue;

      const projectId = String(project.id);

      if (!projectMap[projectId]) {
        projectMap[projectId] = {
          baseProject: project, // lo que YA te funcionaba
          minPrice: Number(listing.singleUnitPrice),
          listings: [],
        };
      }

      projectMap[projectId].listings.push({
        ...listing,
        leftToSell: safeNumber(listing.leftToSell),
        singleUnitPrice: safeNumber(listing.singleUnitPrice),
      });

      const currentPrice = safeNumber(listing.singleUnitPrice);
      if (currentPrice > 0) {
        projectMap[projectId].minPrice = Math.min(
          safeNumber(projectMap[projectId].minPrice),
          currentPrice,
        );
      }
    }

    const projectIds = Object.keys(projectMap);
    console.log("🧩 PROJECT IDS (FROM LISTINGS):", projectIds.length);

    // 🔥 Enriquecer sin romper: si no matchea, cae al baseProject
    const fullProjectMap = await fetchFullProjectsByKeys(projectIds);
    console.log("📚 FULL PROJECTS FOUND:", fullProjectMap.size);

    const marketplaceProjects = projectIds.map((projectId) => {
      const entry = projectMap[projectId];
      const fullInfo = fullProjectMap.get(projectId);

      const merged = {
        ...(entry.baseProject || {}),
        ...(fullInfo || {}), // pisa solo si existe fullInfo
        key: projectId, // tu frontend usa `key`
        minPrice: safeNumber(entry.minPrice),
        listings: entry.listings,
        hasSupply: true,
      };

      return merged;
    });

    console.log("✅ FINAL PROJECT COUNT:", marketplaceProjects.length);

    return res.json({
      count: marketplaceProjects.length,
      items: marketplaceProjects,
    });
  } catch (err) {
    console.error("❌ Marketplace error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Marketplace fetch failed" });
  }
};

/* ==============================
   LISTINGS FOR CHECKOUT
   ✅ Soporta:
   - /api/carbon/listings?listingId=0x...
   - /api/carbon/listing/:id
============================== */

export const getListingByQuery = async (req, res) => {
  try {
    const listingId = req.query?.listingId;
    console.log("🧾 GET LISTING BY QUERY:", listingId);

    if (!listingId) {
      return res.status(400).json({ error: "Missing listingId query param" });
    }

    const listingRes = await axiosCM.get(`/listings/${listingId}`, {
      headers: authHeaders(),
    });

    return res.json(listingRes.data);
  } catch (err) {
    const status = err.response?.status || 500;
    console.error(
      "❌ Listing fetch (query) error:",
      err.response?.data || err.message,
    );
    return res.status(status).json({ error: "Listing fetch failed" });
  }
};

export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🧾 GET LISTING BY PARAM:", id);

    const listingRes = await axiosCM.get(`/listings/${id}`, {
      headers: authHeaders(),
    });

    return res.json(listingRes.data);
  } catch (err) {
    const status = err.response?.status || 500;
    console.error(
      "❌ Listing fetch (param) error:",
      err.response?.data || err.message,
    );
    return res.status(status).json({ error: "Listing fetch failed" });
  }
};

/* ==============================
   SINGLE PROJECT DETAIL (FULL + BUYABLE)
   - trae carbonProjects (info completa)
   - le agrega listings disponibles de ese projectId (para comprar)
============================== */
export const getProjectById = async (req, res) => {
  const { id } = req.params;
  console.log("🧩 GET PROJECT BY ID:", id);

  try {
    // 1) Proyecto full (si existe)
    const fullMap = await fetchFullProjectsByKeys([String(id)]);
    const fullProject = fullMap.get(String(id)) || null;

    // 2) Listings del marketplace para este proyecto (buyable)
    const listingsRes = await axiosCM.get(`/listings`, {
      headers: authHeaders(),
      params: { limit: 200 },
    });

    const listings = Array.isArray(listingsRes.data)
      ? listingsRes.data
      : listingsRes.data?.items || [];

    const availableListings = listings
      .filter((l) => String(l?.project?.id) === String(id))
      .filter((l) => safeNumber(l.leftToSell) > 0)
      .map((l) => ({
        ...l,
        leftToSell: safeNumber(l.leftToSell),
        singleUnitPrice: safeNumber(l.singleUnitPrice),
      }));

    const minPrice =
      availableListings.length > 0
        ? Math.min(
            ...availableListings.map((l) => safeNumber(l.singleUnitPrice)),
          )
        : null;

    // 3) Base project (por si full no matchea)
    const baseProjectFromListing = availableListings[0]?.project || { id };

    const merged = {
      ...(baseProjectFromListing || {}),
      ...(fullProject || {}),
      key: String(id),
      listings: availableListings,
      minPrice: minPrice !== null ? safeNumber(minPrice) : undefined,
      hasSupply: availableListings.length > 0,
    };

    return res.json(merged);
  } catch (err) {
    const status = err.response?.status || 500;
    console.error("❌ Project fetch error:", err.response?.data || err.message);
    return res.status(status).json({ error: "Project fetch failed" });
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
