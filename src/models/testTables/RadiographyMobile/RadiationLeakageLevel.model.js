// models/TubeHousingLeakage.js
import mongoose from 'mongoose';

const LeakageMeasurementSchema = new mongoose.Schema({
    location: { type: String, trim: true },
    left: { type: String, trim: true },
    right: { type: String, trim: true },
    front: { type: String, trim: true },
    back: { type: String, trim: true },
    top: { type: String, trim: true },
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

        // Max Leakage Results
        maxLeakageTubeMR: { type: String, trim: true },      // Max Leakage from Tube in mR/h
        maxLeakageTubeMGy: { type: String, trim: true },     // Max Leakage from Tube in mGy/h
        maxLeakageCollimatorMR: { type: String, trim: true }, // Max Leakage from Collimator in mR/h
        maxLeakageCollimatorMGy: { type: String, trim: true },// Max Leakage from Collimator in mGy/h
        highestLeakageMR: { type: String, trim: true },      // Highest Leakage (Final Result) in mR/h
        highestLeakageMGy: { type: String, trim: true },     // Highest Leakage (Final Result) in mGy/h

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

export default mongoose.model('RadiationLeakageLevelRadiographyMobile', TubeHousingLeakageSchema);
