// models/LinearityOfMasLLoading.js
import mongoose from "mongoose";

const LinearityOfMasLLoadingSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
    index: true,
  },

  // Single exposure condition (FCD & kV) — only one row allowed
  exposureCondition: {
    fcd: {
      type: String,
      required: true,
      trim: true,
      default: "100",
    },
    kv: {
      type: String,
      required: true,
      trim: true,
      default: "80",
    },
  },

  // Dynamic measurement column headers (e.g., Meas 1, Meas 2, etc.)
  measurementHeaders: {
    type: [String],
    required: true,
    default: ["Meas 1", "Meas 2", "Meas 3"],
  },

  // Main linearity table rows
  measurements: [
    {
      mAsRange: {
        type: String,
        required: true,
        trim: true,
      },
      // Array of measured radiation outputs (length matches measurementHeaders)
      measuredOutputs: {
        type: [String], // Stored as string to preserve empty inputs
        required: true,
      },
      // Manually editable or auto-filled
      xMax: { type: String, default: "" },
      xMin: { type: String, default: "" },
      col: { type: String, default: "" },
      remarks: { type: String, enum: ["Pass", "Fail", ""], default: "" },
    },
  ],

  // Tolerance for Coefficient of Linearity (CoL)
  tolerance: {
    type: String,
    required: true,
    default: "0.1",
  },

  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` on save
LinearityOfMasLLoadingSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for fast queries by service
LinearityOfMasLLoadingSchema.index({ serviceId: 1 });

export default mongoose.models.LinearityOfMasLLoading ||
  mongoose.model("LinearityOfMasLLoading", LinearityOfMasLLoadingSchema);