import mongoose from "mongoose";

const HighContrastResolutionSchema = new mongoose.Schema(
  {
    // Measured value: Bar strips resolved on monitor (e.g., "1.60")
    measuredLpPerMm: {
      type: String,
      trim: true,
      default: "",
    },

    // Recommended performance standard (default: 1.50 lp/mm)
    recommendedStandard: {
      type: String,
      trim: true,
      default: "1.50",
    },

    // User-entered tolerance (e.g., "±10%", "+5%", "10%")
    tolerance: {
      type: String,
      trim: true,
      default: "",
    },

    // Computed result: "PASS" or "FAIL" (higher lp/mm = better)
    remark: {
      type: String,
      enum: ["PASS", "FAIL", ""],
      default: "",
    },

    // Foreign keys
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceReport",
      required: true,
    },

    // Optional: soft delete support
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Indexes for fast queries
HighContrastResolutionSchema.index({ reportId: 1 });
HighContrastResolutionSchema.index({ serviceId: 1, reportId: 1 });
HighContrastResolutionSchema.index({ reportId: 1, isDeleted: 1 });

const HighContrastResolution = mongoose.model(
  "HighContrastResolutionFixedRadioFluoro",
  HighContrastResolutionSchema
);

export default HighContrastResolution;