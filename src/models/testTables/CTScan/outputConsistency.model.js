import mongoose from "mongoose";

// Table 1 — FCD values
const fcdRowSchema = new mongoose.Schema({
    fcd: {
        type: String,
        required: false,
    },
});

const radiationOutputRowSchema = new mongoose.Schema({
    kv: {
        type: String,
        required: false,
    },
    mas: {
        type: String,
        required: false,
    },
    outputs: {
        type: [String], 
        default: [],
    },
    avg: {
        type: String,
        required: false,
    },
    remark: {
        type: String,
        required: false,
    },
});

// Main schema for the test
const consistencyOfRadiationOutputSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            default: "Consistency of Radiation Output",
        },

        // Table 1: FCD values
        fcdRows: {
            type: [fcdRowSchema],
            default: [],
        },

        // Table 2: Radiation Output results
        radiationOutputs: {
            type: [radiationOutputRowSchema],
            default: [],
        },

        // Dynamic headers (Meas 1, Meas 2, Meas 3, etc.)
        outputHeaders: {
            type: [String],
            default: [],
        },

        // Tolerance value (e.g., ≤ 5%)
        tolerance: {
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
    "ConsistencyOfRadiationOutput",
    consistencyOfRadiationOutputSchema
);
