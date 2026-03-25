import mongoose from "mongoose";

const { Schema, model } = mongoose;

const Table1RowSchema = new Schema(
  {
    kvp: { type: String, default: "", trim: true },
    sliceThickness: { type: String, default: "", trim: true },
    time: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const Table2RowSchema = new Schema(
  {
    mAsApplied: { type: String, default: "", trim: true },
    measuredOutputs: [{ type: String, default: "", trim: true }],
    xMax: { type: String, default: "", trim: true },
    xMin: { type: String, default: "", trim: true },
    col: { type: String, default: "", trim: true },
    remarks: { type: String, default: "", trim: true },
    avgOutput: { type: Schema.Types.Mixed, default: "" },
    average: { type: Schema.Types.Mixed, default: "" },
    x: { type: Schema.Types.Mixed, default: "" },
  },
  { _id: false }
);

const MeasurementOfMaLinearitySchema = new Schema(
  {
    table1: [Table1RowSchema],
    table2: [Table2RowSchema],
    tolerance: { type: String, default: "0.1", trim: true },
    serviceReportId: { type: Schema.Types.ObjectId, ref: "ServiceReport", required: false },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    tubeId: {
      type: String,
      enum: [null, "frontal", "lateral"],
      default: null,
      required: false,
    },
  },
  { timestamps: true }
);

MeasurementOfMaLinearitySchema.index({ serviceReportId: 1 });
MeasurementOfMaLinearitySchema.index({ serviceId: 1, tubeId: 1 });

export default model("MeasurementOfMaLinearityInventionalRadiology", MeasurementOfMaLinearitySchema);

