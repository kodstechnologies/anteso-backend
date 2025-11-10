import mongoose from "mongoose";

const lowContrastRowSchema = new mongoose.Schema({
    parameter: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: false,
    },
});

const lowContrastResolutionSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
            default: "Low Contrast Resolution",
        },

        rows: {
            type: [lowContrastRowSchema],
            default: [],
        },

        tolerance: {
            type: String,
            default: "",
        },

        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
        },

        createdAt: {
            type: Date,
            default: Date.now,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        },
    },
    { timestamps: true }
);

export default mongoose.model("LowContrastResolution", lowContrastResolutionSchema);
