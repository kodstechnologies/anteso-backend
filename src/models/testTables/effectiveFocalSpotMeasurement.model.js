import mongoose from "mongoose";

// Each focal spot measurement row
const focalSpotRowSchema = new mongoose.Schema({
    stated: {
        type: String,
        required: false,
    },
    measured: {
        type: String,
        required: false,
    },
    tolerance: {
        type: String,
        required: false,
    },
});

// Main schema for Effective Focal Spot Measurement test
const effectiveFocalSpotMeasurementSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            default: "Effective Focal Spot Measurement",
        },

        // All table rows entered by the user
        rows: {
            type: [focalSpotRowSchema],
            default: [],
        },

        // Optional reference to a parent report
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
    "EffectiveFocalSpotMeasurement",
    effectiveFocalSpotMeasurementSchema
);
