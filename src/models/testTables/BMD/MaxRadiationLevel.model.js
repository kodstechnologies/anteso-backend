// models/MaxRadiationLevel.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Single measurement row
const MeasurementSchema = new Schema({
  location: {
    type: String,
    required: true,
    enum: [
      "Control Console (Operator Position)",
      "Behind Chest Stand (if applicable)",
      "Outside Patient Entrance Door",
      "Patient Waiting Area",
    ],
    trim: true,
  },
  mRPerHr: {
    type: String,        // Stored as string to preserve exact input (e.g., "0.012")
    required: true,
    default: '',
    trim: true,
  },
  result: {
    type: String,        // e.g., "Pass (≤ 2 mR/hr)", "Fail (> 0.2 mR/hr)", or ""
    trim: true,
    default: '',
  },
});

const MaxRadiationLevelSchema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },

    serviceReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceReport',
      index: true,
    },

    // Array of exactly 4 locations (order preserved)
    measurements: {
      type: [MeasurementSchema],
      validate: [
        (arr) => arr.length === 4,
        'There must be exactly 4 measurement locations',
      ],
    },

    // Optional: store calculated weekly doses for reporting
    maxWorkerWeeklyDose: { type: String, default: '0.000' },  // mR/week
    maxPublicWeeklyDose: { type: String, default: '0.000' },  // mR/week

    testId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    collection: 'maxradiationlevels',
  }
);

// Compound index for fast queries
MaxRadiationLevelSchema.index({ serviceId: 1, testId: 1 });

// Ensure model is not recompiled in dev
const MaxRadiationLevel =
  mongoose.models.MaxRadiationLevel ||
  model('MaxRadiationLevelForBMD', MaxRadiationLevelSchema);

export default MaxRadiationLevel;