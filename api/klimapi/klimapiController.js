const { calculate, saveCalculationResult, getUserCalculationResults } = require("./klimapiServices");

module.exports.calculate = async (req, res) => {
  try {
    const result = await calculate(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error en cálculo:", error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports.saveCalculationResult = async (req, res) => {
  try {
    const { calculation_id, kgCO2e, results } = req.body;
    await saveCalculationResult({
      userId: req.user._id,
      calculation_id,
      kgCO2e,
      results,
    });
    res.status(201).json({ message: "Resultado guardado" });
  } catch (error) {
    console.error("Error guardando resultado:", error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports.getUserResults = async (req, res) => {
  try {
    const results = await getUserCalculationResults(req.user._id);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error obteniendo resultados:", error.message);
    res.status(500).json({ error: error.message });
  }
};