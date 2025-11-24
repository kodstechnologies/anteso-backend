// models/RadiationLeakageLevel.js
import mongoose from 'mongoose';

const MeasurementSchema = new mongoose.Schema({
  direction: { type: String, trim: true }, // Left, Right, Front, Back, Top
  value: { type: String, trim: true },     // Measured value in mR/h (stored as string)
});

const LeakageLocationSchema = new mongoose.Schema({
  location: { type: String, trim: true },           // "Tube" or "Collimator"
  measurements: [MeasurementSchema],                // 5 directions: Left, Right, Front, Back, Top
  max: { type: String, trim: true },                // Max mR/h (frontend calculated)
  resultMR: { type: String, trim: true },           // Final mR/h after workload correction
  resultMGy: { type: String, trim: true },          // Final mGy/h
});

const RadiationLeakageLevelSchema = new mongoose.Schema(
  {
    // Measurement Settings
    distanceFromFocus: { type: String, trim: true },  // e.g. "100" cm
    kv: { type: String, trim: true },                 // Applied kV
    ma: { type: String, trim: true },                 // Applied mA
    time: { type: String, trim: true },               // Exposure time (sec)

    // Workload
    workload: { type: String, trim: true },           // mA·min/week, e.g. "500"

    // Leakage Data (Tube + Collimator)
    leakageLocations: [LeakageLocationSchema],

    // Final Results
    highestLeakageMR: { type: String, trim: true },   // Highest mR/h (after correction)
    highestLeakageMGy: { type: String, trim: true },  // Highest mGy/h
    finalRemark: { type: String, trim: true },        // "Pass" or "Fail"

    // AERB Tolerance Parameters (editable)
    toleranceArea: { type: String, trim: true, default: "10" },        // cm²
    toleranceDimension: { type: String, trim: true, default: "20" },   // cm
    toleranceDistance: { type: String, trim: true, default: "5" },     // cm
    toleranceLimit: { type: String, trim: true, default: "0.02" },     // mGy/h
    toleranceTime: { type: String, trim: true, default: "1" },         // hour

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
  mongoose.model('RadiationLeakageLevel', RadiationLeakageLevelSchema);