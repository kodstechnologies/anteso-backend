import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const ToleranceSchema = new mongoose.Schema({
  value: { type: String },
  type: { type: String, enum: ['percent', 'kvp'] },
  sign: { type: String, enum: ['plus', 'minus', 'both'] },
});

const Table1RowSchema = new Schema({
  time: { type: String, default: '', trim: true },
  sliceThickness: { type: String, default: '', trim: true },
});

const Table2RowSchema = new Schema({
  setKV: { type: String, default: '', trim: true },
  ma10: { type: String, default: '', trim: true },
  ma100: { type: String, default: '', trim: true },
  ma200: { type: String, default: '', trim: true },
  avgKvp: { type: String, default: '', trim: true },
  remarks: { type: String, default: '', trim: true },
});

const MeasurementOfOperatingPotentialSchema = new Schema(
  {
    table1: [Table1RowSchema],
    table2: [Table2RowSchema],
    tolerance: { type: ToleranceSchema, required: true },
    serviceReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
  },
  { timestamps: true }
);

MeasurementOfOperatingPotentialSchema.index({ serviceReportId: 1 });
MeasurementOfOperatingPotentialSchema.index({ serviceId: 1 });

const AccuracyOfOperatingPotential = model(
  'accuracyOfOperatingPotentialRadigraphyPortable',
  MeasurementOfOperatingPotentialSchema
);

export default AccuracyOfOperatingPotential;
