import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Low Contrast Sensitivity Schema
const LowContrastSensitivitySchema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    serviceReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceReport',
      index: true,
    },
    smallestHoleSize: {
      type: String,
      default: "",
      trim: true,
    },
    recommendedStandard: {
      type: String,
      default: "3.0",
      trim: true,
    },
    remarks: {
      type: String,
      enum: ['Pass', 'Fail', ''],
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for performance
LowContrastSensitivitySchema.index({ serviceReportId: 1 });
LowContrastSensitivitySchema.index({ serviceId: 1 }, { unique: true });

// Update the `updatedAt` field on save
LowContrastSensitivitySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

LowContrastSensitivitySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

LowContrastSensitivitySchema.pre('updateOne', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const LowContrastSensitivity = model(
  'LowContrastSensitivityOBI',
  LowContrastSensitivitySchema
);

export default LowContrastSensitivity;
