// models/CongruenceOfRadiation.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// Sub-schema for Technique Factors (FCD, kV, mAs)
const techniqueFactorSchema = new Schema(
  {
    fcd: { type: Number }, // Focus to Cassette Distance (cm)
    kv: { type: Number },
    mas: { type: Number },
  },
  { _id: false }
);

// Sub-schema for Congruence Measurements
const congruenceMeasurementSchema = new Schema(
  {
    dimension: { type: String },
    observedShift: { type: Number }, // in cm
    edgeShift: { type: Number }, // in cm
    percentFED: { type: Number }, // Auto-calculated on frontend
    tolerance: { type: Number }, // in %
    remark: { type: String },
  },
  { _id: false }
);

const CongruenceOfRadiationSchema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      index: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceReport",
      index: true,
    },
    // Table 1: Technique Factors (user can add multiple rows)
    techniqueFactors: {
      type: [techniqueFactorSchema],
    },
    // Table 2: Congruence Measurements (fixed 2 rows: X and Y)
    congruenceMeasurements: {
      type: [congruenceMeasurementSchema],
    },
    // Optional: Final overall result
    finalResult: {
      type: String,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Ensure only one record per service
CongruenceOfRadiationSchema.index({ serviceId: 1 }, { unique: true });

export default mongoose.model(
  "CongruenceOfRadiationRadioGraphyMobile",
  CongruenceOfRadiationSchema
);
