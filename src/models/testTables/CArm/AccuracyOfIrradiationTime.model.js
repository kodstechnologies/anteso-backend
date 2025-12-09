// models/CArm/AccuracyOfIrradiationTime.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AccuracyOfIrradiationTimeSchema = new Schema({
  serviceReportId: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceReport',
    required: false,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
    index: true,
  },
  // Table 1: Test Conditions (Single fixed row)
  testConditions: {
    fcd: { type: String, default: "" }, // FCD in cm
    kv: { type: String, default: "" },  // kV
    ma: { type: String, default: "" },  // mA
  },

  // Table 2: Accuracy of Irradiation Time (Dynamic rows)
  irradiationTimes: [
    {
      setTime: { type: String, default: "" },      // mSec
      measuredTime: { type: String, default: "" }, // mSec
    },
  ],

  // Tolerance settings
  tolerance: {
    operator: { type: String, default: "<=" },
    value: { type: String, default: "" }, // stored as string to match frontend
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes for performance
AccuracyOfIrradiationTimeSchema.index({ serviceReportId: 1 });
AccuracyOfIrradiationTimeSchema.index({ serviceId: 1 }, { unique: true });

// Update the `updatedAt` field on save
AccuracyOfIrradiationTimeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

AccuracyOfIrradiationTimeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

AccuracyOfIrradiationTimeSchema.pre('updateOne', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const AccuracyOfIrradiationTime = model(
  'AccuracyOfIrradiationTimeCArm',
  AccuracyOfIrradiationTimeSchema
);

export default AccuracyOfIrradiationTime;
