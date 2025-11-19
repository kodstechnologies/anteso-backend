import mongoose from "mongoose";

const parameterSchema = new mongoose.Schema({
  mas: { type: String, required: false },
  sliceThickness: { type: String, required: false },
  time: { type: String, required: false },
});

const outputRowSchema = new mongoose.Schema({
  kvp: { type: String, required: false },
  outputs: { type: [String], default: [] },
  mean: { type: String, required: false },
  cov: { type: String, required: false },
});

const outputConsistencySchema = new mongoose.Schema(
  {
    testName: {
      type: String,
      default: "Output Consistency",
    },

    // Table 1 – fixed single row
    parameters: {
      type: parameterSchema,
      required: false,
    },

    // Table 2
    outputRows: {
      type: [outputRowSchema],
      default: [],
    },

    // Dynamic measurement headers
    measurementHeaders: {
      type: [String],
      default: [],
    },

    // Tolerance (e.g., "2.0")
    tolerance: {
      type: String,
      default: "",
    },

    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceReport",
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
  },
  { timestamps: true }
);

export default mongoose.model("OutputConsistencyForCtScan", outputConsistencySchema);