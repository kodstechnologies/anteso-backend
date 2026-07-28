// models/LinearityOfMaLoading.js (formerly Linearity of Time)
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Test Conditions Schema (FDD, kV, Time)
const TestConditionsSchema = new Schema({
  fdd: { type: String, default: "" }, // FDD in cm
  kv: { type: String, default: "" },  // kV
  time: { type: String, default: "" }, // Time in Sec
}, { _id: false });

// Measurement Row Schema
const MeasurementRowSchema = new Schema({
  maApplied: { type: String, required: true, trim: true }, // mA Applied
  radiationOutputs: { type: [String], default: [] }, // Dynamic array of measurements
  averageOutput: { type: String, default: "" }, // Average Output (mGy) - calculated
  mGyPerMAs: { type: String, default: "" }, // mGy / mAs (X) - calculated
}, { _id: false });

const LinearityOfMaLoadingSchema = new Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true,
  },
  serviceReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceReport',
    index: true,
  },

  // Test Conditions (Fixed)
  testConditions: { type: TestConditionsSchema, default: () => ({}) },

  // Measurement Rows (Dynamic)
  measurementRows: [MeasurementRowSchema],

  // Column headers for dynamic radiation output columns
  measHeaders: {
    type: [String],
    default: [],
  },

  // Summary Values (Calculated)
  xMax: { type: String, default: "" },
  xMin: { type: String, default: "" },
  coefficientOfLinearity: { type: String, default: "" }, // CoL
  remarks: { type: String, enum: ['Pass', 'Fail', ''], default: '' },

  // Tolerance
  tolerance: { type: String, default: '0.1', trim: true },
  toleranceOperator: { type: String, default: '<=', trim: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Update the `updatedAt` field on save
LinearityOfMaLoadingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

LinearityOfMaLoadingSchema.index({ serviceId: 1 }, { unique: true });

// Keep mongoose model name LinearityOfTimeOBI so existing DB documents / ServiceReport refs continue to work.
const LinearityOfMaLoading = mongoose.model('LinearityOfTimeOBI', LinearityOfMaLoadingSchema);
export default LinearityOfMaLoading;
