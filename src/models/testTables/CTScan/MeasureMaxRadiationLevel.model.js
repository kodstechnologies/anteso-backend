// models/MeasureMaxRadiationLevel.model.js
import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const LocationReadingSchema = new Schema({
  location: {
    type: String,
    required: true,
    trim: true,
  },
  mRPerHr: {
    type: String,
    required: true,
  },
  mRPerWeek: {
    type: String,
    required: true,
  },
  result: {
    type: String,
    enum: ['Pass', 'Fail', ''],
    default: '',
  },
  permissibleLimit: {
    type: String,
    required: true,
    enum: ['≤ 2 mR/hr', '≤ 0.2 mR/hr'],
  },
});

const MeasureMaxRadiationLevelSchema = new Schema({
  serviceReportId: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceReport',
    required: false,
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true, // Recommended for lookup
  },
  tubeId: {
    type: String,
    enum: [null, 'A', 'B'],
    default: null,
    required: false,
  },
  readings: [LocationReadingSchema],
  maxWorkerMRPerWeek: { type: String },
  maxPublicMRPerWeek: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` on save
MeasureMaxRadiationLevelSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Create and export the MODEL
const MeasureMaxRadiationLevel = model('MeasureMaxRadiationLevel', MeasureMaxRadiationLevelSchema);

export default MeasureMaxRadiationLevel;