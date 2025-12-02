// models/OutputConsistencyForCArm.js
import mongoose from "mongoose";

const outputRowSchema = new mongoose.Schema(
  {
    ffd: { type: String, trim: true },           // FFD per row
    outputs: [{ type: String, trim: true }],     // measurement values
    mean: { type: String, trim: true },
    cov: { type: String, trim: true },
  },
  { _id: false }
);

const outputConsistencySchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceReport",
      index: true,
    },

    // Single FFD for the entire test (top input)
    ffd: {
      type: String,
      trim: true,
    },

    outputRows: {
      type: [outputRowSchema],
      default: [],
    },

    measurementHeaders: {
      type: [String],
      default: ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
    },

    tolerance: {
      type: String,
      trim: true,
    },

    finalRemark: {
      type: String,
      trim: true,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

outputConsistencySchema.index({ serviceId: 1 }, { unique: true });

export default mongoose.model("OutputConsistencyForFixedRadioFluoro", outputConsistencySchema);
