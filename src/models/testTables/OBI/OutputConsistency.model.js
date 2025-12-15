// models/ReproducibilityOfOutput.js
import mongoose from 'mongoose';

const OutputMeasurementSchema = new mongoose.Schema({
    value: { type: String, trim: true },        // e.g. "1.25" mGy
});

const OutputRowSchema = new mongoose.Schema({
    kv: { type: String, trim: true },           // Applied kV
    mas: { type: String, trim: true },          // mAs
    outputs: [OutputMeasurementSchema],         // Dynamic array of measurements
    avg: { type: String, trim: true },          // Average (X̄) – stored as string
    cv: { type: String, trim: true },           // Coefficient of Variation (CV)
    remark: { type: String, trim: true },       // Pass/Fail or custom text
});

const ReproducibilityOfOutputSchema = new mongoose.Schema(
    {
        ffd: {
            value: {
                type: String,

            }, // e.g. "100" cm
        },
        // Dynamic rows of kV/mAs + measurements
        outputRows: [OutputRowSchema],

        // Tolerance (e.g. "5.0" %)
        tolerance: {
            operator: { type: String, trim: true, default: "<=" },
            value: { type: String, trim: true }
        },

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
ReproducibilityOfOutputSchema.index({ serviceId: 1 });
ReproducibilityOfOutputSchema.index({ reportId: 1 });
ReproducibilityOfOutputSchema.index({ serviceId: 1, reportId: 1 });

export default mongoose.model('OutputConsistencyOBI', ReproducibilityOfOutputSchema);