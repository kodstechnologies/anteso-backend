// models/GantryTilt.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Parameter Schema
const ParameterSchema = new Schema({
  name: { type: String, default: '', trim: true },
  value: { type: String, default: '', trim: true },
});

// Measurement Schema
const MeasurementSchema = new Schema({
  actual: { type: String, default: '', trim: true },
  measured: { type: String, default: '', trim: true },
});

const GantryTiltSchema = new Schema(
  {
    parameters: [ParameterSchema],
    measurements: [MeasurementSchema],
    toleranceSign: {
      type: String,
      enum: ['+', '-', '±'],
      default: '±',
      trim: true,
    },
    toleranceValue: {
      type: String,
      default: '2',
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    serviceReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'gantrytiltctscan',
  }
);

// Indexes for performance
GantryTiltSchema.index({ serviceId: 1 });
GantryTiltSchema.index({ serviceReportId: 1 });

const GantryTilt = model('GantryTiltCTScan', GantryTiltSchema);

export default GantryTilt;

