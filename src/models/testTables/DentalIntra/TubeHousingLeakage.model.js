// models/TubeHousingLeakage.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const tubeHousingLeakageSchema = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceReport",
      required: false,
    },

    // === Measurement Settings ===
    measurementSettings: {
      distance: { type: String, required: true },     // e.g., "100" cm
      kv: { type: String, required: true },           // kVp
      ma: { type: String, required: true },           // mA
      time: { type: String, required: true },         // seconds
    },

    // === Leakage Measurements (5 directions + Top) ===
    leakageMeasurements: [
      {
        location: { type: String, default: "Tube Housing" },
        front: { type: String, default: "" },
        back: { type: String, default: "" },
        left: { type: String, default: "" },
        right: { type: String, default: "" },
        top: { type: String, default: "" },             // New: Top direction
        max: { type: String, default: "" },             // Auto-calculated on frontend
        unit: { type: String, default: "mGy/h" },
      },
    ],

    // === Workload ===
    workload: {
      value: { type: String, required: true },        // e.g., "500"
      unit: { type: String, default: "mA·min/week" },
    },

    // === Tolerance ===
    tolerance: {
      value: { type: String, required: true },        // e.g., "1.0"
      operator: { type: String, enum: ["less than or equal to", "greater than or equal to", "="], default: "less than or equal to" },
      time: { type: String, default: "1" },           // usually "1" hour
    },

    // Optional: Store final calculated result (useful for reports)
    calculatedResult: {
      maxLeakageIntermediate: { type: String },       // (workload × max) / 6000
      finalLeakageRate: { type: String },             // ÷ 114 → mGy/h at 1m
      remark: { type: String, enum: ["Pass", "Fail", ""], default: "" },
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Prevent model overwrite in development
const TubeHousingLeakage =
 
  mongoose.model("TubeHousingLeakageDentalIntra", tubeHousingLeakageSchema);

export default TubeHousingLeakage;