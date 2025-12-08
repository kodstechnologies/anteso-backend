// models/OutputConsistencyForOArm.js
import mongoose from "mongoose";

const outputRowSchema = new mongoose.Schema({
  kvp: { type: String, required: true, trim: true },
  ma: { type: String, trim: true },
  outputs: [{ type: String, trim: true }], // array of measurement strings
  mean: { type: String }, // stored as string to preserve formatting
  cov: { type: String },  // COV as decimal (e.g., "0.0123")
  remark: { type: String },
}, { _id: false });

const outputConsistencySchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      unique: true,     // Only one test per machine
      index: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceReport",
      index: true,
    },

    // Fixed test parameters
    parameters: {
      ffd: { type: String, trim: true,},   // ← FFD in cm
      time: { type: String, trim: true },  // ← Exposure time
    },

    // Dynamic table
    outputRows: {
      type: [outputRowSchema],
      default: [],
      validate: [v => v.length >= 1, "At least one kVp row is required"],
    },

    // Custom measurement headers (Meas 1, Meas 2, etc.)
    measurementHeaders: {
      type: [String],
      default: ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
    },

    // Tolerance value (e.g., "2.0")
    tolerance: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional: store final remark
    finalRemark: {
      type: String,
      enum: ["Pass", "Fail", ""],
      default: "",
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure only one document per serviceId
outputConsistencySchema.index({ serviceId: 1 }, { unique: true });

export default mongoose.model("OutputConsistencyForOArm", outputConsistencySchema);
