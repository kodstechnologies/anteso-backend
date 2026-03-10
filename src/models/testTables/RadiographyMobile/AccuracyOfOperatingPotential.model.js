import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AccuracyOfOperatingPotentialSchema = new Schema(
    {
        serviceReportId: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceReport',
            required: false,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },

        // Configurable mA station column headers (e.g. ["50 mA", "100 mA"])
        mAStations: {
            type: [String],
            default: ['50 mA', '100 mA'],
        },

        // One row per applied kVp
        measurements: [
            {
                appliedKvp: { type: String },
                measuredValues: [{ type: String }],
                averageKvp: { type: String },
                remarks: { type: String },
            },
        ],

        // Tolerance for kVp (OBI-style: {sign, value})
        tolerance: {
            sign: { type: String },   // "±", "+", "-"
            value: { type: String },  // e.g. "2.0"
        },

        // Total Filtration section
        totalFiltration: {
            measured: { type: String },
            required: { type: String },
            atKvp: { type: String },
        },

        // Filtration Tolerance thresholds
        filtrationTolerance: {
            forKvGreaterThan70: { type: String, default: '1.5' },
            forKvBetween70And100: { type: String, default: '2.0' },
            forKvGreaterThan100: { type: String, default: '2.5' },
            kvThreshold1: { type: String, default: '70' },
            kvThreshold2: { type: String, default: '100' },
        },
    },
    { timestamps: true }
);

AccuracyOfOperatingPotentialSchema.index({ serviceId: 1 });

const AccuracyOfOperatingPotential = model(
    'accuracyOfOperatingPotentialRadigraphyMobile',
    AccuracyOfOperatingPotentialSchema
);

export default AccuracyOfOperatingPotential;
