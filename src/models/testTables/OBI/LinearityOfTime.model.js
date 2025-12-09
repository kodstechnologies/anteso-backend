// models/LinearityOfTime.js
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
  radiationOutput1: { type: String, default: "" }, // Radiation Output (mGy) - measurement 1
  radiationOutput2: { type: String, default: "" }, // Radiation Output (mGy) - measurement 2
  radiationOutput3: { type: String, default: "" }, // Radiation Output (mGy) - measurement 3
  averageOutput: { type: String, default: "" }, // Average Output (mGy) - calculated
  mGyPerMAs: { type: String, default: "" }, // mGy / mAs (X) - calculated
}, { _id: false });

const LinearityOfTimeSchema = new Schema({
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

  // Summary Values (Calculated)
  xMax: { type: String, default: "" },
  xMin: { type: String, default: "" },
  coefficientOfLinearity: { type: String, default: "" }, // CoL
  remarks: { type: String, enum: ['Pass', 'Fail', ''], default: '' },

  // Tolerance
  tolerance: { type: String, default: '0.1', trim: true },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Update the `updatedAt` field on save
LinearityOfTimeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

LinearityOfTimeSchema.index({ serviceId: 1 }, { unique: true });

const LinearityOfTime = mongoose.model('LinearityOfTimeOBI', LinearityOfTimeSchema);
export default LinearityOfTime;
