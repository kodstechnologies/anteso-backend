// models/MaxRadiationLevel.js
import mongoose from 'mongoose';

const MeasurementSchema = new mongoose.Schema({
    location: { type: String, trim: true },        // e.g. "Control Console (Operator Position)"
    mRPerHr: { type: String, trim: true },         // Input value in mR/hr (stored as string)
});

const MaxRadiationLevelSchema = new mongoose.Schema(
    {
        // Array of 5 fixed locations with measured values
        measurements: [MeasurementSchema],

        // Optional final result (can be computed on frontend)
        workerMaxWeekly: { type: String, trim: true },    // e.g. "0.850"
        publicMaxWeekly: { type: String, trim: true },    // e.g. "0.120"

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
MaxRadiationLevelSchema.index({ serviceId: 1 });
MaxRadiationLevelSchema.index({ reportId: 1 });
MaxRadiationLevelSchema.index({ serviceId: 1, reportId: 1 });

export default mongoose.models.MaxRadiationLevel ||
    mongoose.model('MaxRadiationLevel', MaxRadiationLevelSchema);