// models/TotalFilterationForInventionalRadiology.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const TotalFilterationSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
  },

  // Table 1: kVp Accuracy at Different mA Stations
  mAStations: {
    type: [String],
  },

  measurements: [
    {
      appliedKvp: { type: String,  },
      measuredValues: [{ type: String, }], // Must have values
      averageKvp: { type: String },
      remarks: { type: String }, // No enum — fully flexible
    },
  ],

  // Tolerance for kVp
  tolerance: {
    sign: { type: String, },    // e.g., "±", "+", "-"
    value: { type: String,  },   // e.g., "2.0"
  },

  // Table 2: Total Filtration (align with RadiographyFixed — atKvp + mm Al values)
  totalFiltration: {
    measured: { type: String },  // mm Al (alternate field name from some UIs)
    required: { type: String },  // mm Al (primary input in IR form for measured filtration)
    atKvp: { type: String },     // kVp at which total filtration is assessed
  },
  filtrationTolerance: {
    forKvGreaterThan70: { type: String, default: "1.5" },
    forKvBetween70And100: { type: String, default: "2.0" },
    forKvGreaterThan100: { type: String, default: "2.5" },
    kvThreshold1: { type: String, default: "70" },
    kvThreshold2: { type: String, default: "100" },
  },

  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceReport",
  },

  // Tube ID for double tube support (frontal/lateral)
  tubeId: {
    type: String,
    enum: [null, 'frontal', 'lateral'],
    default: null,
    required: false,
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
TotalFilterationSchema.index({ serviceId: 1, tubeId: 1 });

const TotalFilterationForInventionalRadiology = model(
  'TotalFilterationForInventionalRadiology',
  TotalFilterationSchema
);

 export default TotalFilterationForInventionalRadiology;