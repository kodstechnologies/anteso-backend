// models/RadiationLeakageLevel.js
import mongoose from "mongoose";

const leakageMeasurementSchema = new mongoose.Schema({
  location: { type: String, required: true, trim: true },
  front: { type: Number, default: 0 },
  back: { type: Number, default: 0 },
  left: { type: Number, default: 0 },
  right: { type: Number, default: 0 },
  unit: { type: String, default: "mGy/h", trim: true },
}, { _id: false });

const radiationLeakageSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      unique: true,
      index: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceReport",
      index: true,
    },

    // Measurement Settings (kV, mA, Time, FCD)
    measurementSettings: {
      kv: { type: Number, required: true },
      ma: { type: Number, required: true },
      time: { type: Number, required: true },     // in seconds
      fcd: { type: Number, required: true },      // Focus to Chamber Distance in cm
    },

    // Leakage Readings (usually 1 row: "Tube")
    leakageMeasurements: {
      type: [leakageMeasurementSchema],
      validate: [v => v.length >= 1, "At least one leakage measurement required"],
    },

    // Workload
    workload: { type: Number, required: true },           // e.g., 500
    workloadUnit: { type: String, default: "mA·min/week" },

    // Tolerance
    tolerance: { type: String, required: true, trim: true },     // e.g., "1.0"
    toleranceOperator: {
      type: String,
      enum: ["less than or equal to", "greater than or equal to", "="],
      default: "less than or equal to",
    },
    toleranceTime: { type: String, default: "1" },  // hours

    // Optional: store final calculated values
    maxLeakagePerHour: { type: String },  // mGy/h
    finalResult: {
      type: String,
      enum: ["Pass", "Fail", ""],
      default: "",
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Only one record per service
radiationLeakageSchema.index({ serviceId: 1 }, { unique: true });

export default mongoose.model("RadiationLeakageLevelForCArm", radiationLeakageSchema);