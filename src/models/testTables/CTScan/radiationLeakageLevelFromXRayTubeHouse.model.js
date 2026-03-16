// models/RadiationLeakageTest.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

/**
 * Measurement Settings (kV, mA, Time)
 */
const SettingsRowSchema = new Schema({
    kv: { type: String, trim: true, default: '' },
    ma: { type: String, trim: true, default: '' },
    time: { type: String, trim: true, default: '' }, // in seconds
});

/**
 * Leakage Measurement per Location (align with RadiographyFixed: left, right, front, back, top)
 */
const LeakageRowSchema = new Schema({
    location: { type: String, trim: true, required: true },
    left: { type: String, trim: true, default: '' },
    right: { type: String, trim: true, default: '' },
    front: { type: String, trim: true, default: '' },
    back: { type: String, trim: true, default: '' },
    top: { type: String, trim: true, default: '' },
    max: { type: String, trim: true, default: '' },
    result: { type: String, trim: true, default: '' },
    unit: { type: String, trim: true, default: 'mR/h' },
    mgy: { type: String, trim: true, default: '' },
    remark: { type: String, enum: ['Pass', 'Fail', ''], default: '' },
}, { _id: false });

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
        tubeId: {
            type: String,
            enum: [null, 'A', 'B'],
            default: null,
            required: false,
        },
        // === Test conditions (RadiographyFixed-style) ===
        fcd: { type: String, trim: true, default: '' },
        kv: { type: String, trim: true, default: '' },
        ma: { type: String, trim: true, default: '' },
        time: { type: String, trim: true, default: '' },
        workload: { type: String, default: '' },
        workloadUnit: { type: String, default: 'mA·min/week' },
        settings: [SettingsRowSchema],
        leakageMeasurements: [LeakageRowSchema],
        toleranceValue: { type: String, default: '' },
        toleranceOperator: {
            type: String,
            enum: ['less than or equal to', 'greater than or equal to', '='],
            default: 'less than or equal to',
        },
        toleranceTime: { type: String, default: '1' },
        remark: { type: String, trim: true, default: '' },
        performedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
    },
    {
        timestamps: true,
      
    }
);

// Optional: Index for performance
RadiationLeakageTestSchema.index({ serviceId: 1, performedAt: -1 });
RadiationLeakageTestSchema.index({ serviceId: 1, tubeId: 1 });

export default model('RadiationLeakageTest', RadiationLeakageTestSchema);