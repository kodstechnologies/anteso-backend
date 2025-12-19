// models/MeasyrementOfCTDI.mjs
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Table 1 Row
const Table1RowSchema = new Schema({
  kvp: { type: String, default: '', trim: true },
  mAs: { type: String, default: '', trim: true },
  sliceThickness: { type: String, default: '', trim: true },
});

// Peripheral Reading
const PeripheralReadingSchema = new Schema({
  label: { type: String, default: 'A', trim: true },
  head: { type: String, default: '', trim: true },
  body: { type: String, default: '', trim: true },
});

// Table 2 Row
const Table2RowSchema = new Schema({
  result: { type: String, required: true },
  head: { type: String, default: '', trim: true },
  body: { type: String, default: '', trim: true },
  readings: [PeripheralReadingSchema], // Only for Peripheral Dose
});

// Main Schema
const MeasurementOfCTDISchema = new Schema(
  {
    table1: [Table1RowSchema],
    table2: [Table2RowSchema],
    tolerance: {
      expected: {
        value: { type: String, default: '', trim: true },
        quote: { type: String, default: '', trim: true },
      },
      maximum: {
        value: { type: String, default: '', trim: true },
        quote: { type: String, default: '', trim: true },
      },
    },
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

MeasurementOfCTDISchema.index({ serviceReportId: 1 });
MeasurementOfCTDISchema.index({ serviceId: 1, tubeId: 1 });

const MeasurementOfCTDI = model('MeasurementOfCTDI', MeasurementOfCTDISchema);

export default MeasurementOfCTDI;