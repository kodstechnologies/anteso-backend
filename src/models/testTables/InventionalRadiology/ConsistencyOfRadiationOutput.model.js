// models/ConsistencyOfRadiationOutput.js
import mongoose from 'mongoose';

const outputRowSchema = new mongoose.Schema(
    {
        kvp: { type: String, trim: true },
        mas: { type: String, trim: true },
        outputs: [{ type: String, trim: true }],     // Dynamic measurement values
        mean: { type: String, trim: true },
        cov: { type: String, trim: true },
        remarks: { type: String, trim: true },
    },
    { _id: false }
);

const ConsistencyOfRadiationOutputSchema = new mongoose.Schema(
    {
        // FDD for the entire test
        fdd: {
            value: { type: String },
        },

        outputRows: {
            type: [outputRowSchema],
            default: [],
        },

        // Dynamic measurement headers (Meas 1, Meas 2, etc.)
        measurementHeaders: {
            type: [String],
            default: ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
        },

        // Tolerance (e.g. "5.0" % or "0.05")
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

        // Tube ID for double tube support (frontal/lateral)
        tubeId: {
            type: String,
            enum: [null, 'frontal', 'lateral'],
            default: null,
            required: false,
        },

        // Soft delete
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Indexes for performance
ConsistencyOfRadiationOutputSchema.index({ serviceId: 1 });
ConsistencyOfRadiationOutputSchema.index({ reportId: 1 });
ConsistencyOfRadiationOutputSchema.index({ serviceId: 1, reportId: 1 });
ConsistencyOfRadiationOutputSchema.index({ serviceId: 1, tubeId: 1 });

const ConsistencyOfRadiationOutput = mongoose.models.ConsistencyOfRadiationOutputInventionalRadiology ||
    mongoose.model('ConsistencyOfRadiationOutputInventionalRadiology', ConsistencyOfRadiationOutputSchema);

export default ConsistencyOfRadiationOutput;
