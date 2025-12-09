// models/RadiationLeakageTest.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Measurement Settings (FFD, kVp, mA, Time)
 */
const SettingsRowSchema = new Schema({
    ffd: { type: String, trim: true, default: '' }, // FFD in cm
    kvp: { type: String, trim: true, default: '' },
    ma: { type: String, trim: true, default: '' },
    time: { type: String, trim: true, default: '' }, // in seconds
});

/**
 * Leakage Measurement per Location
 */
const LeakageRowSchema = new Schema({
    location: { type: String, trim: true, required: true }, // e.g., "Tube", "Collimator"
    left: { type: String, trim: true, default: '' },
    right: { type: String, trim: true, default: '' },
    top: { type: String, trim: true, default: '' },
    up: { type: String, trim: true, default: '' },
    down: { type: String, trim: true, default: '' },
    max: { type: String, trim: true, default: '' }, // auto-calculated
    unit: { type: String, trim: true, default: '' },
    remark: { type: String, default: '' },
});

/**
 * Main Test Document
 */
const RadiationLeakageTestSchema = new Schema(
    {
        // Foreign key to your service / equipment
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        },
        // === Workload ===
        workload: { type: String, required: true }, // e.g., "500"
        workloadUnit: { type: String, default: '' },

        // === Measurement Settings ===
        settings: [SettingsRowSchema],

        // === Leakage Measurements ===
        leakageMeasurements: [LeakageRowSchema],

        // === Calculated Fields ===
        maxLeakageResult: { type: String, default: '' },     // (workload × max) / (60 × 100)
        maxRadiationLeakage: { type: String, default: '' },  // result / 114

        // === Tolerance ===
        toleranceValue: { type: String, default: '' },       // e.g., "1.0"
        toleranceOperator: {
            type: String,
            default: '',
        },
        toleranceTime: { type: String, default: '' },       // in hours

        // === Metadata ===
       
        performedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
    },
    {
        timestamps: true,
      
    }
);

// Optional: Index for performance
RadiationLeakageTestSchema.index({ serviceId: 1 }, { unique: true });

export default model('RadiationLeakageTestOPG', RadiationLeakageTestSchema);

