import Retirement from "./retirementsModel.js";
import mongoose from "mongoose";

export const createRetirement = async (req, res) => {
  try {
    const { project, paymentId, selectedVintage, order, walletAddress } =
      req.body;

    if (!order) {
      return res.status(400).json({ message: "No se recibió la orden." });
    }

    if (!project || !paymentId) {
      return res.status(400).json({ message: "Faltan datos requeridos." });
    }

    const existingRetirement = await Retirement.findOne({ payment: paymentId });
    if (existingRetirement) {
      return res.status(200).json({
        message: "Ya existe un registro de retirement para este pago.",
        retirement: existingRetirement,
      });
    }

    const retirement = await Retirement.create({
      project: { ...project, selectedVintage },
      payment: paymentId,
      order: order.order,
      quote: order.quote,
      walletAddress,
    });

    return res.status(201).json({
      message: "Registro de retirement creado correctamente.",
      retirement,
    });
  } catch (error) {
    console.error("Error al crear el registro de retirement:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

export const getRetirementsList = async (req, res) => {
  try {
    const { walletAddress } = req.query;

    const localRetirements = await Retirement.find({ walletAddress });

    return res.status(200).json({
      local: localRetirements,
    });
  } catch (error) {
    console.error("Error fetching retirements:", error);
    return res.status(500).json({ message: "Error fetching retirements" });
  }
};

export const getRetirementDetail = async (req, res) => {
  try {
    const { id, walletAddress } = req.params;

    const localRetirement = await Retirement.findOne({
      walletAddress,
      _id: id,
    });

    return res.status(200).json({
      retirement: localRetirement,
      retirementId: localRetirement?._id,
    });
  } catch (error) {
    console.error("Error fetching retirement detail:", error);
    return res
      .status(500)
      .json({ message: "Error fetching retirement detail" });
  }
};

export const getRetirementByPaymentId = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res
        .status(400)
        .json({ message: "paymentId no es un ObjectId válido" });
    }

    const retirement = await Retirement.findOne({
      payment: new mongoose.Types.ObjectId(paymentId),
    });

    return res.status(200).json({ retirement });
  } catch (error) {
    console.error("Error fetching retirement by payment ID:", error);
    return res
      .status(500)
      .json({ message: "Error fetching retirement by payment ID" });
  }
};

export const getRetirementsSummary = async (req, res) => {
  try {
    const { walletAddress } = req.query;

    if (!walletAddress) {
      return res.status(400).json({ message: "walletAddress es requerido." });
    }

    const retirements = await Retirement.find({ walletAddress });

    let totalTonnes = 0;
    let lastRetirementAt = null;

    retirements.forEach((r) => {
      const qty =
        Number(r.project?.quantityTonnes) ||
        Number(r.project?.quantity) ||
        Number(r.project?.tonnes) ||
        0;

      totalTonnes += qty;

      if (!lastRetirementAt || r.createdAt > lastRetirementAt) {
        lastRetirementAt = r.createdAt;
      }
    });

    return res.status(200).json({
      totalRetirements: retirements.length,
      totalTonnes,
      lastRetirementAt,
    });
  } catch (error) {
    console.error("Error obteniendo resumen de retirements:", error);
    return res.status(500).json({ message: "Error obteniendo resumen." });
  }
};
