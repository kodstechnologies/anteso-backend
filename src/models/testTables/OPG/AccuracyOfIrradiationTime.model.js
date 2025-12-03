// models/AccuracyOfIrradiationTime.js
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
      setTime: { type: String, required: true },      // mSec
      measuredTime: { type: String, required: true }, // mSec
    },
  ],

  // Tolerance settings
  tolerance: {
    operator: { type: String, default: "" },
    value: { type: String, default: "" }, // stored as string to match frontend
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the `updatedAt` field on save
AccuracyOfIrradiationTimeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

AccuracyOfIrradiationTimeSchema.index({ serviceId: 1 }, { unique: true });

const AccuracyOfIrradiationTime = model(
  'AccuracyOfIrradiationTimeOPG',
  AccuracyOfIrradiationTimeSchema
);

export default AccuracyOfIrradiationTime;

