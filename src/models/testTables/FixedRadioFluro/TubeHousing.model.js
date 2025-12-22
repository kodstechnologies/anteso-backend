// models/TubeHousingLeakage.js
import mongoose from 'mongoose';

const LeakageMeasurementSchema = new mongoose.Schema({
    location: { type: String, trim: true }, // "Tube" or "Collimator"
    left: { type: Number, default: 0 },
    right: { type: Number, default: 0 },
    front: { type: Number, default: 0 },
    back: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    max: { type: String, trim: true },
    result: { type: String, trim: true },
    unit: { type: String, trim: true },
    mgy: { type: String, trim: true },
});

const TubeHousingLeakageSchema = new mongoose.Schema(
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

// Indexes for performance
TubeHousingLeakageSchema.index({ serviceId: 1 });
TubeHousingLeakageSchema.index({ reportId: 1 });
TubeHousingLeakageSchema.index({ serviceId: 1, reportId: 1 });
TubeHousingLeakageSchema.index({ isDeleted: 1 });

export default mongoose.models.TubeHousingLeakage ||
    mongoose.model('TubeHousingLeakageFixedRadioFlouro', TubeHousingLeakageSchema);