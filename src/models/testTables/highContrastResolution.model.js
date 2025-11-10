import mongoose from "mongoose";

// Each parameter-value row
const highContrastRowSchema = new mongoose.Schema({
    parameter: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: false,
    },
});

// Main test schema
const highContrastResolutionSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            default: "High Contrast Resolution",
        },

        // Array of user-entered rows (parameter + value)
        rows: {
            type: [highContrastRowSchema],
            default: [],
        },

        // Optional tolerance input from user
        tolerance: {
            type: String,
            default: "",
        },

        // Optional link to a parent report or service order
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

export default mongoose.model("HighContrastResolution", highContrastResolutionSchema);
