import mongoose from "mongoose";

const measuredValueSchema = new mongoose.Schema({
    values: {
        type: [String],
        default: [],
    },
    averageKvp: {
        type: String,
    },
    remarks: {
        type: String,
    },
    appliedKvp: {
        type: String,
    },
});

const accuracyOfOperatingPotentialSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            default: "Accuracy of Operating Potential",
        },

        // Each test has multiple rows
        rows: {
            type: [measuredValueSchema],
            default: [],
        },

        measuredHeaders: {
            type: [String], // ["Meas 1", "Meas 2", "Meas 3"]
            default: [],
        },

        tolerance: {
            type: String,
        },

        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model(
    "AccuracyOfOperatingPotential",
    accuracyOfOperatingPotentialSchema
);
