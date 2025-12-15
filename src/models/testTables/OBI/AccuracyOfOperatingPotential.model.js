// models/testTables/OBI/AccuracyOfOperatingPotential.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AccuracyOfOperatingPotentialSchema = new Schema({
    serviceReportId: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceReport',
        required: false,
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    },

    // Table 1: kVp Accuracy at Different mA Stations
    mAStations: {
        type: [String],
    },

    // Single FFD value for the test (cm)
    ffd: {
        type: String,
    },

    measurements: [
        {
            appliedKvp: { type: String, },
            measuredValues: [{ type: String, }], // Must have values
            averageKvp: { type: String },
            remarks: { type: String }, // No enum — fully flexible
        },
    ],

    // Tolerance for kVp
    tolerance: {
        sign: { type: String, },    // e.g., "±", "+", "-"
        value: { type: String, },   // e.g., "2.0"
    },

    // Table 2: Total Filtration
    totalFiltration: {
        measured: { type: String },  // mm Al
        required: { type: String },  // mm Al
    },

    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceReport",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Auto-update updatedAt
AccuracyOfOperatingPotentialSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance
AccuracyOfOperatingPotentialSchema.index({ serviceId: 1 });
AccuracyOfOperatingPotentialSchema.index({ reportId: 1 });

const AccuracyOfOperatingPotential = model(
    'accuracyOfOperatingPotentialOBI',
    AccuracyOfOperatingPotentialSchema
);

export default AccuracyOfOperatingPotential;