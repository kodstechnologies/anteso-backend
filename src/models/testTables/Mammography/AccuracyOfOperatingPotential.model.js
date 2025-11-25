// models/AccuracyOfOperatingPotential.js
import mongoose from "mongoose";

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

    // Dynamic mA station headers (e.g., "50 mA", "100 mA", "200 mA")
    mAStations: {
        type: [String],

    },

    // Table measurements
    measurements: [
        {
            appliedKvp: {
                type: String,
                trim: true,
            },
            measuredValues: {
                type: [String], // Stores as string to preserve empty inputs

            },
            averageKvp: {
                type: String,
                default: "",
            },
            remarks: {
                type: String,
                enum: ["PASS", "FAIL", "-"],
            },
        },
    ],

    // Tolerance settings
    tolerance: {
        sign: {
            type: String,
            enum: ["+", "-", "±"],


        },
        value: {
            type: String, // Keep as string to match input field
            required: true,

        },
    },

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