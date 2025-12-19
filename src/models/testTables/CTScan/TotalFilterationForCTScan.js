// models/TotalFilterationForCTScan.mjs
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const RowSchema = new Schema({
  appliedKV: { type: String, default: '', trim: true },
  appliedMA: { type: String, default: '', trim: true },
  time: { type: String, default: '', trim: true },
  sliceThickness: { type: String, default: '', trim: true },
  measuredTF: { type: String, default: '', trim: true }, // rounded to 2 decimals
  remark: { type: String, default: '', trim: true },
});

const TotalFilterationForCTScanSchema = new Schema(
  {
    rows: [RowSchema],
    tolerance: { type: String, default: '', trim: true },
    serviceReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
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

TotalFilterationForCTScanSchema.index({ serviceReportId: 1 });
TotalFilterationForCTScanSchema.index({ serviceId: 1, tubeId: 1 });

const TotalFilterationForCTScan = model(
  'TotalFilterationForCTScan',
  TotalFilterationForCTScanSchema
);

export default TotalFilterationForCTScan;