// models/TotalFilterationForInventionalRadiology.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const TotalFilterationSchema = new Schema({
  serviceReportId: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceReport',
    required: false,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
  },

  // Table 1: kVp Accuracy at Different mA Stations
  mAStations: {
    type: [String],
  },

  // Single FFD value for the test (cm)
  ffd: {
    type: String,
  },

  measurements: [
    {
      appliedKvp: { type: String, },
      measuredValues: [{ type: String, }], // Must have values
      averageKvp: { type: String },
      remarks: { type: String }, // No enum — fully flexible
    },
  ],

  // Tolerance for kVp (frontend may send `type` or `sign`)
  tolerance: {
    sign: { type: String, },
    type: { type: String, },
    value: { type: String, },
  },

  // Table 2: Total Filtration (atKvp = "Total filtration is (at ___ kVp)")
  totalFiltration: {
    measured: { type: String },
    required: { type: String },
    atKvp: { type: String },
  },

  // Threshold table used with total filtration
  filtrationTolerance: {
    forKvGreaterThan70: { type: String },
    forKvBetween70And100: { type: String },
    forKvGreaterThan100: { type: String },
    kvThreshold1: { type: String },
    kvThreshold2: { type: String },
  },

  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceReport",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update updatedAt
TotalFilterationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
TotalFilterationSchema.index({ serviceId: 1 });
TotalFilterationSchema.index({ reportId: 1 });

const AccuracyOfOperatingPotential = model(
  'AccuracyOfOperatingPotentialCBCT',
  TotalFilterationSchema
);

export default AccuracyOfOperatingPotential;