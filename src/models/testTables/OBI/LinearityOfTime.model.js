// models/testTables/OBI/LinearityOfTime.model.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/** Fixed test conditions: FFD, kV, mA */
const TestConditionsSchema = new Schema(
  {
    ffd: { type: String, default: "", trim: true }, // FFD (cm)
    kv: { type: String, default: "", trim: true }, // kV
    ma: { type: String, default: "", trim: true }, // mA
  },
  { _id: false }
);

/**
 * One measurement row per time applied.
 * radiationOutputs: multiple readings as an array (e.g. ["1.2", "1.3", "1.1"])
 */
const MeasurementRowSchema = new Schema(
  {
    timeApplied: { type: String, default: "", trim: true }, // Time applied (s)
    radiationOutputs: {
      type: [String],
      default: [],
    }, // Multiple radiation output readings
    averageOutput: { type: String, default: "", trim: true }, // Average Output
    x: { type: String, default: "", trim: true }, // X (mGy / time or similar)
  },
  { _id: false }
);

const LinearityOfTimeSchema = new Schema(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    serviceReportId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceReport",
      index: true,
    },

    // FFD, kV, mA
    testConditions: {
      type: TestConditionsSchema,
      default: () => ({}),
    },

    /**
     * timeApplied is stored per row in this array.
     * Each row has its own radiationOutputs array.
     */
    measurementRows: {
      type: [MeasurementRowSchema],
      default: [],
    },

    // Headers for dynamic radiation-output reading columns (Meas 1, Meas 2, ...)
    measHeaders: {
      type: [String],
      default: [],
    },

    // Summary
    xMax: { type: String, default: "", trim: true },
    xMin: { type: String, default: "", trim: true },
    col: { type: String, default: "", trim: true }, // Coefficient of Linearity
    remark: {
      type: String,
      enum: ["Pass", "Fail", ""],
      default: "",
    },

    // Tolerance
    tolerance: { type: String, default: "0.1", trim: true },
    toleranceOperator: { type: String, default: "<=", trim: true },
  },
  { timestamps: true }
);

LinearityOfTimeSchema.index({ serviceId: 1 }, { unique: true });

const LinearityOfTime = mongoose.model(
  "LinearityOfTimeForOBI",
  LinearityOfTimeSchema
);

export default LinearityOfTime;
