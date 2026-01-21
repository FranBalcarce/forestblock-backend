const mongoose = require('mongoose');

const CalculationResultDetailSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      trim: true,
    },
    activity: {
      type: String,
      trim: true,
    },
    specification: {
      type: String,
      trim: true,
    },
    detail: {
      type: String,
      trim: true,
    },
    value: {
      type: Number,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
    },
    kgCO2e: {
      type: Number,
      min: 0,
    },
    emission_factor_id: {
      type: Number,
    },
    emission_factor_last_updated: {
      type: Date,
    },
  },
  { _id: false }
);

module.exports = CalculationResultDetailSchema;
