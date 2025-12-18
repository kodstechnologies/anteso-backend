// models/TablePosition.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Exposure Parameter Schema
const ExposureParameterSchema = new Schema({
  kvp: { type: String, default: '', trim: true },
  ma: { type: String, default: '', trim: true },
  sliceThickness: { type: String, default: '', trim: true },
});

// Table Incrementation Row Schema
const TableIncrementationRowSchema = new Schema({
  tablePosition: { type: String, default: '', trim: true },
  expected: { type: String, default: '', trim: true },
  measured: { type: String, default: '', trim: true },
});

const TablePositionSchema = new Schema(
  {
    initialTablePosition: {
      type: String,
      default: '',
      trim: true,
    },
    loadOnCouch: {
      type: String,
      default: '',
      trim: true,
    },
    exposureParameters: [ExposureParameterSchema],
    tableIncrementation: [TableIncrementationRowSchema],
    toleranceSign: {
      type: String,
      enum: ['+', '-', '±'],
      default: '±',
      trim: true,
    },
    toleranceValue: {
      type: String,
      default: '2',
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    serviceReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'tablepositionctscan',
  }
);

// Indexes for performance
TablePositionSchema.index({ serviceId: 1 });
TablePositionSchema.index({ serviceReportId: 1 });

const TablePosition = model('TablePositionCTScan', TablePositionSchema);

export default TablePosition;

