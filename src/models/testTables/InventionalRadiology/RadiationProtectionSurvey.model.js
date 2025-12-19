
import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true,
  },
  mRPerHr: {
    type: String,
    trim: true,
  },
  mRPerWeek: {
    type: String,
    trim: true
  },
  result: {
    type: String,
    trim: true,
  },
  calculatedResult: {
    type: String,
    trim: true
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
  },

  // 2. Equipment Settings
  appliedCurrent: { type: String, trim: true },
  appliedVoltage: { type: String, trim: true },
  exposureTime: { type: String, trim: true },
  workload: { type: String, trim: true },

  // 3. Dynamic table rows
  locations: [LocationSchema],

  // Optional metadata
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

  },

  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceReport",
    index: true,
  },

  // Tube ID for double tube support (frontal/lateral) - null for common tests
  tubeId: {
    type: String,
    enum: [null, 'frontal', 'lateral'],
    default: null,
    required: false,
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

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

// Indexes
RadiationProtectionSurveySchema.index({ serviceId: 1, tubeId: 1 });

// Use specific collection for IR
export default mongoose.models.RadiationProtectionSurveyInventionalRadiology ||
  mongoose.model("RadiationProtectionSurveyInventionalRadiology", RadiationProtectionSurveySchema);