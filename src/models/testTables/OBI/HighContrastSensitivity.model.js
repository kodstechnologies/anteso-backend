import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// High Contrast Sensitivity Schema
const HighContrastSensitivitySchema = new Schema(
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
    measuredLpPerMm: {
      type: String,
      default: "",
      trim: true,
    },
    recommendedStandard: {
      type: String,
      default: "1.50",
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
HighContrastSensitivitySchema.index({ serviceReportId: 1 });
HighContrastSensitivitySchema.index({ serviceId: 1 }, { unique: true });

// Update the `updatedAt` field on save
HighContrastSensitivitySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

HighContrastSensitivitySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

HighContrastSensitivitySchema.pre('updateOne', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const HighContrastSensitivity = model(
  'HighContrastSensitivityOBI',
  HighContrastSensitivitySchema
);

export default HighContrastSensitivity;
