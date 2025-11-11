// models/LowContrastResolutionForCTScan.mjs
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Table 1 Row
const ParamRowSchema = new Schema({
  parameter: { type: String, default: '', trim: true },
  value: { type: String, default: '', trim: true },
});

// Table 2 Row
const ResultRowSchema = new Schema({
  size: { type: String, default: '', trim: true },
  value: { type: String, default: '', trim: true },
  unit: { type: String, default: '', trim: true },
});

// Main Schema
const LowContrastResolutionForCTScanSchema = new Schema(
  {
    table1: [ParamRowSchema],
    table2: [ResultRowSchema],
    tolerance: { type: String, default: '', trim: true },
    serviceReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
    },
  },
  { timestamps: true }
);

LowContrastResolutionForCTScanSchema.index({ serviceReportId: 1 });

const LowContrastResolutionForCTScan = model(
  'LowContrastResolutionForCTScan',
  LowContrastResolutionForCTScanSchema
);

export default LowContrastResolutionForCTScan;