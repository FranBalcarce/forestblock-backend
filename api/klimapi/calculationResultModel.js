const mongoose = require('mongoose');
const CalculationResultDetailSchema = require('./calculationDetailModel');

const CalculationResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    calculation_id: {
      type: String,
      required: true,
      index: true,
    },
    kgCO2e: {
      type: Number,
      required: true,
      min: 0,
    },
    results: {
      type: [CalculationResultDetailSchema],
      required: true,
      validate: v => Array.isArray(v) && v.length > 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('CalculationResult', CalculationResultSchema);
