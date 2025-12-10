// models/testTables/RadiographyMobileHT/TotalFilteration.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const TotalFilterationSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },

  // Table 1: kVp Accuracy at Different mA Stations
  mAStations: {
    type: [String],
    default: [],
  },

  measurements: [
    {
      appliedKvp: { type: String },
      measuredValues: [{ type: String }],
      averageKvp: { type: String },
      remarks: { type: String },
    },
  ],

  // Tolerance for kVp
  tolerance: {
    sign: { type: String, default: "±" },
    value: { type: String, default: "2.0" },
  },

  // Table 2: Total Filtration
  totalFiltration: {
    measured: { type: String },
    required: { type: String },
    appliedKV: { type: String },
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

const TotalFilterationRadiographyMobileHT = model(
  'TotalFilterationRadiographyMobileHT',
  TotalFilterationSchema
);

export default TotalFilterationRadiographyMobileHT;

