import mongoose from "mongoose";

const acquisitionParamsSchema = new mongoose.Schema({
  kvp: { type: String, trim: true, default: "120" },
  ma: { type: String, trim: true, default: "200" },
  sliceThickness: { type: String, trim: true, default: "5.0" },
  ww: { type: String, trim: true, default: "400" },
});

const resultSchema = new mongoose.Schema({
  observedSize: { type: String, trim: true },
  contrastLevel: { type: String, trim: true, default: "1.0" },
});

const toleranceSchema = new mongoose.Schema({
  size: { type: String, trim: true },
  contrast: { type: String, trim: true },
  unit: { type: String, default: "mm", enum: ["mm", "lp/cm"], trim: true },
  description: { type: String, trim: true, default: "" },
});

const lowContrastResolutionSchema = new mongoose.Schema(
  {
    // testName: {
    //   type: String,
    //   default: "Low Contrast Resolution for CT Scan",
    //   trim: true,
    // },
    acquisitionParams: {
      type: acquisitionParamsSchema,
      default: () => ({}),
    },
    result: {
      type: resultSchema,
      default: () => ({}),
    },
    tolerances: {
      type: [toleranceSchema],
      default: [
        { size: "5.0", contrast: "1.0", unit: "mm", description: "minimum" },
        { size: "2.5", contrast: "0.5", unit: "mm", description: "expected" },
      ],
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceReport",
    },
    tubeId: {
      type: String,
      enum: [null, 'A', 'B'],
      default: null,
      required: false,
    },
  },
  { timestamps: true }
);

lowContrastResolutionSchema.index({ serviceId: 1, tubeId: 1 }, { unique: true });

export default mongoose.model(
  "LowContrastResolutionForCTScan",
  lowContrastResolutionSchema
);