const axios = require("axios");
const CalculationResult = require("./calculationResultModel");

const calculate = async (payload) => {
  const url = "https://api.klimapi.com/v2/calculate";
  const data = payload;
  const headers = {
    "Content-Type": "application/json",
    "X-API-KEY": process.env.KLIMAPI_API_KEY,
  };
  const response = await axios.post(url, data, { headers });
  return response.data;
};

const saveCalculationResult = async ({ userId, calculation_id, kgCO2e, results }) => {
  return CalculationResult.create({ userId, calculation_id, kgCO2e, results });
};

const getUserCalculationResults = async (userId) => {
  return CalculationResult.find({ userId }).sort({ createdAt: -1 });
};

module.exports = { calculate, saveCalculationResult, getUserCalculationResults };
