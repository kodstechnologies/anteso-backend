// models/AccuracyOfIrradiationTime.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AccuracyOfIrradiationTimeSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
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
      setTime: { type: String,  },      // mSec
      measuredTime: { type: String,  }, // mSec
    },
  ],

  // Tolerance settings
  tolerance: {
    operator: { type: String },
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

const AccuracyOfIrradiationTime = model(
  'AccuracyOfIrradiationTimeRadiographyMobileHT',
  AccuracyOfIrradiationTimeSchema
);

export default AccuracyOfIrradiationTime;
