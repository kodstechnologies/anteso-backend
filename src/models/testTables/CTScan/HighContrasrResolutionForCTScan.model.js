// models/HighContrastResolutionForCTScan.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Operating Parameters Schema
const OperatingParamsSchema = new Schema({
  kvp: { type: String, trim: true, default: '120' },
  mas: { type: String, trim: true, default: '200' },
  sliceThickness: { type: String, trim: true, default: '5.0' },
  ww: { type: String, trim: true, default: '400' },
}, { _id: false });

// Result Schema
const ResultSchema = new Schema({
  observedSize: { type: String, trim: true, default: '1.0' },
  contrastDifference: { type: String, trim: true, default: '10' },
}, { _id: false });

// Tolerance Schema
const ToleranceSchema = new Schema({
  contrastDifference: { type: String, trim: true, default: '10' },
  size: { type: String, trim: true, default: '1.6' },
  lpCm: { type: String, trim: true, default: '3.12' },
  expectedSize: { type: String, trim: true, default: '0.8' },
  expectedLpCm: { type: String, trim: true, default: '6.25' },
}, { _id: false });

// Main Schema
const HighContrastResolutionForCTScanSchema = new Schema(
  {
    operatingParams: {
      type: OperatingParamsSchema,
      default: () => ({}),
    },
    result: {
      type: ResultSchema,
      default: () => ({}),
    },
    tolerance: {
      type: ToleranceSchema,
      default: () => ({}),
    },
    // Legacy fields for backward compatibility (optional)
    table1: [{ 
      parameter: { type: String, default: '', trim: true },
      value: { type: String, default: '', trim: true },
    }],
    table2: [{
      size: { type: String, default: '', trim: true },
      value: { type: String, default: '', trim: true },
      unit: { type: String, default: '', trim: true },
    }],
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
    },
    tubeId: {
      type: String,
      enum: [null, 'A', 'B'],
      default: null,
      required: false,
    },
  },
  { timestamps: true }
);

HighContrastResolutionForCTScanSchema.index({ serviceId: 1 });
HighContrastResolutionForCTScanSchema.index({ serviceReportId: 1 });
HighContrastResolutionForCTScanSchema.index({ serviceId: 1, tubeId: 1 });

const HighContrastResolutionForCTScan = model(
  'HighContrastResolutionForCTScan',
  HighContrastResolutionForCTScanSchema
);

export default HighContrastResolutionForCTScan;
