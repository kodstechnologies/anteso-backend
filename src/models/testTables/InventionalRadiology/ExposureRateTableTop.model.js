import mongoose from "mongoose";

const exposureRateRowSchema = new mongoose.Schema({
    distance: { type: String }, // cm
    appliedKv: { type: String }, // kV
    appliedMa: { type: String }, // mA
    exposure: { type: String }, // cGy/Min
    remark: { type: String }, // "AEC Mode" or "Manual Mode"
    result: { type: String, }
});

const exposureRateTableTopSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    },

    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceReport",
    },

    // Main data table
    rows: {
        type: [exposureRateRowSchema],
        default: [],
    },

    // Dynamic tolerance values
    nonAecTolerance: { type: String }, // Exposure rate without AEC mode (cGy/Min)
    aecTolerance: { type: String }, // Exposure rate with AEC mode (cGy/Min)
    minFocusDistance: { type: String }, // Minimum focus to tabletop distance (cm)

    // Tube ID for double tube support (frontal/lateral)
    tubeId: {
        type: String,
        enum: [null, 'frontal', 'lateral'],
        default: null,
        required: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Auto-update updatedAt
exposureRateTableTopSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance
exposureRateTableTopSchema.index({ serviceId: 1 });
exposureRateTableTopSchema.index({ reportId: 1 });
exposureRateTableTopSchema.index({ serviceId: 1, tubeId: 1 });

export default mongoose.models.ExposureRateTableTopInventionalRadiology ||
    mongoose.model("ExposureRateTableTopInventionalRadiology", exposureRateTableTopSchema);
