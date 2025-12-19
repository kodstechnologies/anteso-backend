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

    // Tube ID for double tube support (frontal/lateral)
    tubeId: {
        type: String,
        enum: [null, 'frontal', 'lateral'],
        default: null,
        required: false,
    },

}, {
    timestamps: true,
});

// Indexes
LowContrastResolutionSchema.index({ serviceId: 1, tubeId: 1 });

const LowContrastResolution = mongoose.models.LowContrastResolutionInventionalRadiology ||
    mongoose.model("LowContrastResolutionInventionalRadiology", LowContrastResolutionSchema);

export default LowContrastResolution;