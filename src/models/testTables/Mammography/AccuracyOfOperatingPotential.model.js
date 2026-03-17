// models/AccuracyOfOperatingPotential.js
import mongoose from "mongoose";

// Table 1 Row Schema
const Table1RowSchema = new mongoose.Schema({
    time: { type: String, default: '', trim: true },
    sliceThickness: { type: String, default: '', trim: true },
});

// Table 2 Row Schema
const Table2RowSchema = new mongoose.Schema({
    setKV: { type: String, default: '', trim: true },
    ma10: { type: String, default: '', trim: true },
    ma100: { type: String, default: '', trim: true },
    ma200: { type: String, default: '', trim: true },
    avgKvp: { type: String, default: '', trim: true },
    remarks: { type: String, default: '', trim: true },
});

// Tolerance Schema
const ToleranceSchema = new mongoose.Schema({
    value: { type: String },
    type: { type: String, enum: ['percent', 'absolute'] },
    sign: { type: String, enum: ['plus', 'minus', 'both'] },
});

// Total Filtration (same as RadiographyFixed TotalFilteration)
const totalFiltrationSchema = new mongoose.Schema({
    measured: { type: String, default: '' },
    required: { type: String, default: '' },
    atKvp: { type: String, default: '' },
}, { _id: false });

const filtrationToleranceSchema = new mongoose.Schema({
    forKvGreaterThan70: { type: String, default: '1.5' },
    forKvBetween70And100: { type: String, default: '2.0' },
    forKvGreaterThan100: { type: String, default: '2.5' },
    kvThreshold1: { type: String, default: '70' },
    kvThreshold2: { type: String, default: '100' },
}, { _id: false });

const AccuracyOfOperatingPotentialSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        index: true,
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceReport',
    },

    // Table 1: Time vs Slice Thickness (single row)
    table1: [Table1RowSchema],

    // Table 2: kV Measurement at Different mA
    table2: [Table2RowSchema],

    // Tolerance settings
    tolerance: { type: ToleranceSchema, required: true },

    totalFiltration: { type: totalFiltrationSchema, default: () => ({}) },
    filtrationTolerance: { type: filtrationToleranceSchema, default: () => ({}) },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update `updatedAt` on save
AccuracyOfOperatingPotentialSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Ensure indexes for performance
AccuracyOfOperatingPotentialSchema.index({ serviceId: 1 });

export default mongoose.models.AccuracyOfOperatingPotential ||
    mongoose.model("AccuracyOfOperatingPotentialMammography", AccuracyOfOperatingPotentialSchema);