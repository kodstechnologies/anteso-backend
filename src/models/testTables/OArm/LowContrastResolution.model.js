import mongoose from "mongoose";

const LowContrastResolutionSchema = new mongoose.Schema({
    // Measured value entered by user
    smallestHoleSize: {
        type: String,
        trim: true,
        default: "",
    },

    // Recommended performance standard (default 3.0)
    recommendedStandard: {
        type: String,
        trim: true,
        default: "3.0",
    },

    // Tolerance (e.g., "±5%", "+10%", etc.)
    tolerance: {
        type: String,
        trim: true,
        default: "",
    },

    // Hidden remark: "PASS" or "FAIL" (computed on frontend, stored here)
    remark: {
        type: String,
        default: "",
    },

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    },

    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceReport",
    },

}, {
    timestamps: true, // adds createdAt & updatedAt
});

const LowContrastResolution = mongoose.model("LowContrastResolutionOArm", LowContrastResolutionSchema);

export default LowContrastResolution;
