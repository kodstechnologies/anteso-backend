// models/RadiationLeakageLevel.js
import mongoose from 'mongoose';

const LeakageMeasurementSchema = new mongoose.Schema({
    location: { type: String, trim: true },
    left: { type: String, trim: true },
    right: { type: String, trim: true },
    front: { type: String, trim: true },
    back: { type: String, trim: true },
    top: { type: String, trim: true },
    max: { type: String, trim: true },
    result: { type: String, trim: true },
    unit: { type: String, trim: true, default: 'mR/h' },
    mgy: { type: String, trim: true },
});

const RadiationLeakageLevelSchema = new mongoose.Schema(
  {
    // Measurement Settings
    fcd: { type: String, trim: true },
    kv: { type: String, trim: true },
    ma: { type: String, trim: true },
    time: { type: String, trim: true },

    // Workload
    workload: { type: String, trim: true },

    // Leakage Measurements (Tube + Collimator)
    leakageMeasurements: [LeakageMeasurementSchema],

    // Tolerance
    toleranceValue: { type: String, trim: true },
    toleranceOperator: { type: String, trim: true }, // "less than or equal to", "greater than or equal to", "="
    toleranceTime: { type: String, trim: true },

    // Final Result (optional - can be computed on frontend)
    remark: { type: String, trim: true }, // "Pass", "Fail", or empty

    // Foreign Keys
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceReport',
    },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
RadiationLeakageLevelSchema.index({ serviceId: 1 });
RadiationLeakageLevelSchema.index({ reportId: 1 });
RadiationLeakageLevelSchema.index({ serviceId: 1, reportId: 1 });

export default mongoose.models.RadiationLeakageLevel ||
  mongoose.model('RadiationLeakageLevelMammography', RadiationLeakageLevelSchema);