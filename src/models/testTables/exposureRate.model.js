import mongoose from "mongoose";

// Define each row's structure
const exposureRateRowSchema = new mongoose.Schema({
    distance: {
        type: String,
        required: false,
    },
    appliedKv: {
        type: String,
        required: false,
    },
    appliedMa: {
        type: String,
        required: false,
    },
    exposure: {
        type: String,
        required: false,
    },
    remark: {
        type: String,
        required: false,
    },
});

// Main schema for the Exposure Rate test
const exposureRateTableTopSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            default: "Exposure Rate at Table Top",
        },

        rows: {
            type: [exposureRateRowSchema],
            default: [],
        },

        tolerance: {
            type: String,
            default: "",
        },

        note: {
            type: String,
            default: "",
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
    "ExposureRateTableTop",
    exposureRateTableTopSchema
);
