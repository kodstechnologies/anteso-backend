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