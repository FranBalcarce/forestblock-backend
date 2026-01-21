const axios = require("axios");
const qs = require("qs");

const API_BASE_URL = process.env.MANGLAI_BASE_URL;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

module.exports.getDashboardData = async (companyId, startDate, endDate) => {
  try {
    const consumptionsUrl = `${API_BASE_URL}/consumptions/dashboard?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`;
    const emissionsUrl = `${API_BASE_URL}/emissions/dashboard?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}&hasSplitEmissions=1`;

    const [consumptionsResponse, emissionsResponse] = await Promise.all([
      axios.get(consumptionsUrl, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }),
      axios.get(emissionsUrl, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }),
    ]);

    const consumptions = consumptionsResponse.data;
    const emissions = emissionsResponse.data;

    return {
      consumptions,
      emissions,
    };
  } catch (error) {
    console.error("getDashboardData error: ", error);
    throw new Error("Error fetching dashboard data: " + error.message);
  }
};

module.exports.getBuildings = async (companyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/companies/${companyId}/buildings`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getBuildings error: ", error);
    throw new Error("Error fetching buildings: " + error.message);
  }
};

module.exports.getConsumptions = async (companyId, startDate, endDate) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/consumptions?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getConsumptions error: ", error);
    throw new Error("Error fetching consumptions: " + error.message);
  }
};

module.exports.getConsumptionById = async (id, companyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/consumptions/${id}?companyId=${companyId}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getConsumptionById error: ", error);
    throw new Error("Error fetching consumption by ID: " + error.message);
  }
};

module.exports.getEmissions = async (companyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/emissions?companyId=${companyId}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getEmissions error: ", error);
    throw new Error("Error fetching emissions: " + error.message);
  }
};

module.exports.getEmissionsDashboard = async (
  companyId,
  buildingIds,
  startDate,
  endDate
) => {
  try {
    const params = {
      companyId,
      buildingIds,
      startDate,
      endDate,
    };

    const queryString = qs.stringify(params, { arrayFormat: "repeat" });

    const response = await axios.get(
      `${API_BASE_URL}/emissions?${queryString}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );

    return response.data;
  } catch (error) {
    console.error("getEmissionsDashboard error: ", error);
    throw new Error("Error fetching emissions dashboard: " + error.message);
  }
};

module.exports.getVehicles = async (companyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vehicles?companyId=${companyId}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getVehicles error: ", error);
    throw new Error("Error fetching vehicles: " + error.message);
  }
};

module.exports.getVehiclesDashboard = async (companyId, startDate, endDate) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vehicles/dashboard?companyId=${companyId}&startDate=${startDate}&endDate=${endDate}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getVehiclesDashboard error: ", error);
    throw new Error("Error fetching vehicles dashboard: " + error.message);
  }
};

module.exports.getVehicleById = async (id, companyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/vehicles/${id}?companyId=${companyId}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getVehicleById error: ", error);
    throw new Error("Error fetching vehicle by ID: " + error.message);
  }
};

module.exports.getCategories = async (options = {}) => {
  try {
    const filteredOptions = Object.entries(options).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );
    const params = new URLSearchParams(filteredOptions);
    const response = await axios.get(
      `${API_BASE_URL}/categories?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getCategories error: ", error);
    throw new Error("Error fetching categories: " + error.message);
  }
};

module.exports.getEmployees = async (companyId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/employees?companyId=${companyId}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}`, accept: "*/*" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("getEmployees error: ", error);
    throw new Error("Error fetching employees: " + error.message);
  }
};
