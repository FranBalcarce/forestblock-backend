import {
  getBuildings,
  getCategories,
  getDashboardData,
  getConsumptions,
  getConsumptionById,
  getEmissions,
  getVehicles,
  getVehicleById,
  getVehiclesDashboard,
  getEmissionsDashboard,
  getEmployees,
} from "./manglaiServices.js";

/* =========================
   CATEGORIES
========================= */
export const fetchCategories = async (req, res) => {
  const { page, limit, level, category } = req.query;
  try {
    const data = await getCategories({ page, limit, level, category });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   DASHBOARD
========================= */
export const fetchDashboard = async (req, res) => {
  const companyId = req.params.companyId;
  const { startDate, endDate } = req.query;

  try {
    const data = await getDashboardData(companyId, startDate, endDate);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   BUILDINGS
========================= */
export const fetchBuildings = async (req, res) => {
  const companyId = req.params.companyId;
  const { startDate, endDate } = req.query;

  try {
    const data = await getBuildings(companyId, startDate, endDate);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   CONSUMPTIONS
========================= */
export const fetchConsumptions = async (req, res) => {
  const companyId = req.params.companyId;
  const { startDate, endDate } = req.query;

  try {
    const data = await getConsumptions(companyId, startDate, endDate);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchConsumptionById = async (req, res) => {
  const { id, companyId } = req.params;
  try {
    const data = await getConsumptionById(id, companyId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   EMISSIONS
========================= */
export const fetchEmissions = async (req, res) => {
  const companyId = req.params.companyId;
  try {
    const data = await getEmissions(companyId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchEmissionsDashboard = async (req, res) => {
  const companyId = req.params.companyId;
  const { buildingIds, startDate, endDate } = req.query;

  const buildingsArray = buildingIds ? buildingIds.split(",") : [];

  try {
    const data = await getEmissionsDashboard(
      companyId,
      buildingsArray,
      startDate,
      endDate,
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   VEHICLES
========================= */
export const fetchVehicles = async (req, res) => {
  const companyId = req.params.companyId;
  const { startDate, endDate } = req.query;

  try {
    const [vehicles, dashboard] = await Promise.all([
      getVehicles(companyId),
      getVehiclesDashboard(companyId, startDate, endDate),
    ]);

    res.status(200).json({ vehicles, dashboard });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const fetchVehicleById = async (req, res) => {
  const { id, companyId } = req.params;
  try {
    const data = await getVehicleById(id, companyId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* =========================
   EMPLOYEES
========================= */
export const fetchEmployees = async (req, res) => {
  const companyId = req.params.companyId;
  try {
    const data = await getEmployees(companyId);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
