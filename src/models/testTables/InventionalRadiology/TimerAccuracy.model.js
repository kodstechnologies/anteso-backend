import mongoose from "mongoose";

const { Schema, model } = mongoose;

const Table1RowSchema = new Schema(
  {
    kvp: { type: String, default: "", trim: true },
    sliceThickness: { type: String, default: "", trim: true },
    ma: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const Table2RowSchema = new Schema(
  {
    setTime: { type: String, default: "", trim: true },
    observedTime: { type: String, default: "", trim: true },
    percentError: { type: String, default: "", trim: true },
    remarks: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const TimerAccuracySchema = new Schema(
  {
    table1: [Table1RowSchema],
    table2: [Table2RowSchema],
    tolerance: { type: String, default: "", trim: true },
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

TimerAccuracySchema.index({ serviceReportId: 1 });
TimerAccuracySchema.index({ serviceId: 1, tubeId: 1 });

export default model("TimerAccuracyInventionalRadiology", TimerAccuracySchema);

