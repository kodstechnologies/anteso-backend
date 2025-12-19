// models/RadiationProtectionSurvey.js
import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true,
  },
  mRPerHr: {
    type: String,        // e.g., "0.850", "1.200" — kept as string for exact display
    trim: true,
    // no default, no enum → full flexibility
  },
  mRPerWeek: {
    type: String,        // calculated on frontend/backend, stored as string for precision
    trim: true
  },
  result: {
    type: String,        // "PASS", "FAIL", or empty
    trim: true,
  },
  calculatedResult: {
    type: String,        // calculated result field
    trim: true,
  },
  category: {
    type: String,
    trim: true
  },
});

const RadiationProtectionSurveySchema = new mongoose.Schema({
  // 1. Survey Details
  surveyDate: {
    type: Date,
    required: true
  },
  hasValidCalibration: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
    // Accepts: "YES", "NO", "N/A", or anything user types — no strict enum
  },

  // 2. Equipment Settings (all optional & flexible)
  appliedCurrent: { type: String, trim: true },
  appliedVoltage: { type: String, trim: true },
  exposureTime: { type: String, trim: true },
  workload: { type: String, trim: true },

  // 3. Dynamic table rows
  locations: [LocationSchema],

  // Optional metadata (very useful for reports)
  hospitalName: { type: String, trim: true },
  equipmentId: { type: String, trim: true },
  roomNo: { type: String, trim: true },
  manufacturer: { type: String, trim: true },
  model: { type: String, trim: true },
  surveyorName: { type: String, trim: true },
  surveyorDesignation: { type: String, trim: true },
  remarks: { type: String, trim: true },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },

  serviceReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceReport",
    index: true,
  },
  tubeId: {
    type: String,
    enum: [null, 'A', 'B'],
    default: null,
    required: false,
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` on every save
RadiationProtectionSurveySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

RadiationProtectionSurveySchema.pre('updateOne', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

RadiationProtectionSurveySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
RadiationProtectionSurveySchema.index({ serviceId: 1 });
RadiationProtectionSurveySchema.index({ serviceId: 1, tubeId: 1 });

export default mongoose.models.RadiationProtectionSurveyCTScan ||
  mongoose.model("RadiationProtectionSurveyCTScan", RadiationProtectionSurveySchema);

