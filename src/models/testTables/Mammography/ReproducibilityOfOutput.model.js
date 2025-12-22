// models/ReproducibilityOfOutput.js
import mongoose from 'mongoose';

const OutputRowSchema = new mongoose.Schema({
    kv: { type: String, trim: true },           // Applied kV
    mas: { type: String, trim: true },          // mAs
    outputs: [{ type: String, trim: true }],    // Dynamic array of measurement strings
    avg: { type: String, trim: true },          // Average (X̄) – stored as string
    cov: { type: String, trim: true },          // Coefficient of Variation (CV) – stored as string
    remark: { type: String, enum: ['Pass', 'Fail', ''], default: '', trim: true },       // Pass/Fail
});

const ReproducibilityOfOutputSchema = new mongoose.Schema(
    {
        // Dynamic rows of kV/mAs + measurements
        outputRows: [OutputRowSchema],

        // Tolerance (e.g. "5.0" for 5%)
        tolerance: { type: String, trim: true },

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

export default mongoose.models.ReproducibilityOfOutput ||
    mongoose.model('ReproducibilityOfOutputMmmography', ReproducibilityOfOutputSchema);