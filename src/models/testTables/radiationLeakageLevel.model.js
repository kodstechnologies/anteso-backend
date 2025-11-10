import mongoose from "mongoose";

// Table 1 — Measurement Settings (FCM & Time)
const measurementSettingSchema = new mongoose.Schema({
    fcm: {
        type: String,
        required: false,
    },
    time: {
        type: String,
        required: false,
    },
});

// Table 2 — Leakage Measurement Results
const leakageMeasurementSchema = new mongoose.Schema({
    location: {
        type: String,
        required: false,
    },
    left: {
        type: String,
        required: false,
    },
    right: {
        type: String,
        required: false,
    },
    front: {
        type: String,
        required: false,
    },
    back: {
        type: String,
        required: false,
    },
    top: {
        type: String,
        required: false,
    },
    result: {
        type: String,
        required: false,
    },
    remark: {
        type: String,
        required: false,
    },
});

// Main schema
const radiationLeakageLevelSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            default: "Radiation Leakage Level",
        },

        // Table 1
        measurementSettings: {
            type: [measurementSettingSchema],
            default: [],
        },

        // Table 2
        leakageMeasurements: {
            type: [leakageMeasurementSchema],
            default: [],
        },

        // Tolerance (mGy/h)
        tolerance: {
            type: String,
            default: "",
        },

        // Notes (array of strings)
        notes: {
            type: [String],
            default: [],
        },

        // Optional link to parent Service Report
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
    "RadiationLeakageLevel",
    radiationLeakageLevelSchema
);
