import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const ToleranceSchema = new mongoose.Schema({
  value: { type: String },
  type: { type: String },
  sign: { type: String },
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
  // New fields for dynamic mA stations
  appliedKvp: { type: String, default: '', trim: true },
  measuredValues: [{ type: String }],
  averageKvp: { type: String, default: '', trim: true },
  mAStations: [{ type: String }],
});

const TotalFiltrationSchema = new Schema({
  measured: { type: String, default: '', trim: true },
  required: { type: String, default: '', trim: true },
  atKvp: { type: String, default: '', trim: true },
}, { _id: false });

const FiltrationToleranceSchema = new Schema({
  forKvGreaterThan70: { type: String, default: '1.5', trim: true },
  forKvBetween70And100: { type: String, default: '2.0', trim: true },
  forKvGreaterThan100: { type: String, default: '2.5', trim: true },
  kvThreshold1: { type: String, default: '70', trim: true },
  kvThreshold2: { type: String, default: '100', trim: true },
}, { _id: false });

const MeasurementOfOperatingPotentialSchema = new Schema(
  {
    table1: [Table1RowSchema],
    table2: [Table2RowSchema],
    mAStations: [{ type: String }],
    tolerance: { type: ToleranceSchema, required: true },
    totalFiltration: { type: TotalFiltrationSchema, default: () => ({}) },
    filtrationTolerance: { type: FiltrationToleranceSchema, default: () => ({}) },
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
  'accuracyOfOperatingPotentialRadigraphyMobile',
  MeasurementOfOperatingPotentialSchema
);

export default AccuracyOfOperatingPotential;
