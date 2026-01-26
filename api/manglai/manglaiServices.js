import axios from "axios";
import qs from "qs";

const API_BASE_URL = process.env.MANGLAI_BASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

/* =========================
   DASHBOARD
========================= */
export const getDashboardData = async (companyId, startDate, endDate) => {
  try {
    const consumptionsUrl = `${API_BASE_URL}/consumptions/dashboard?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`;
    const emissionsUrl = `${API_BASE_URL}/emissions/dashboard?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}&hasSplitEmissions=1`;

    const [consumptionsResponse, emissionsResponse] = await Promise.all([
      axios.get(consumptionsUrl, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }),
      axios.get(emissionsUrl, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }),
    ]);

    return {
      consumptions: consumptionsResponse.data,
      emissions: emissionsResponse.data,
    };
  } catch (error) {
    throw new Error("Error fetching dashboard data: " + error.message);
  }
};

/* =========================
   BUILDINGS
========================= */
export const getBuildings = async (companyId) => {
  const response = await axios.get(
    `${API_BASE_URL}/companies/${companyId}/buildings`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};

/* =========================
   CONSUMPTIONS
========================= */
export const getConsumptions = async (companyId, startDate, endDate) => {
  const response = await axios.get(
    `${API_BASE_URL}/consumptions?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};

export const getConsumptionById = async (id, companyId) => {
  const response = await axios.get(
    `${API_BASE_URL}/consumptions/${id}?companyId=${companyId}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};

/* =========================
   EMISSIONS
========================= */
export const getEmissions = async (companyId) => {
  const response = await axios.get(
    `${API_BASE_URL}/emissions?companyId=${companyId}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};

export const getEmissionsDashboard = async (
  companyId,
  buildingIds,
  startDate,
  endDate,
) => {
  const params = {
    companyId,
    buildingIds,
    startDate,
    endDate,
  };

  const queryString = qs.stringify(params, { arrayFormat: "repeat" });

  const response = await axios.get(`${API_BASE_URL}/emissions?${queryString}`, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
  });

  return response.data;
};

/* =========================
   VEHICLES
========================= */
export const getVehicles = async (companyId) => {
  const response = await axios.get(
    `${API_BASE_URL}/vehicles?companyId=${companyId}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};

export const getVehiclesDashboard = async (companyId, startDate, endDate) => {
  const response = await axios.get(
    `${API_BASE_URL}/vehicles/dashboard?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};

export const getVehicleById = async (id, companyId) => {
  const response = await axios.get(
    `${API_BASE_URL}/vehicles/${id}?companyId=${companyId}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};

/* =========================
   CATEGORIES
========================= */
export const getCategories = async (options = {}) => {
  const filtered = Object.fromEntries(
    Object.entries(options).filter(([, v]) => v !== undefined),
  );

  const params = new URLSearchParams(filtered);

  const response = await axios.get(
    `${API_BASE_URL}/categories?${params.toString()}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );

  return response.data;
};

/* =========================
   EMPLOYEES
========================= */
export const getEmployees = async (companyId) => {
  const response = await axios.get(
    `${API_BASE_URL}/employees?companyId=${companyId}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } },
  );
  return response.data;
};
