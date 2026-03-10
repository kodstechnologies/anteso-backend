import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true,
    },
    mRPerHr: {
        type: String,        // e.g., "0.850", "1.200"
        trim: true,
    },
    mRPerWeek: {
        type: String,
        trim: true
    },
    result: {
        type: String,        // "PASS", "FAIL", or empty
        trim: true,
    },
    category: {
        type: String,
        trim: true
    },
    calculatedResult: {
        type: String,
        trim: true
    }
});

const RadiationProtectionSurveySchema = new mongoose.Schema({
    // 1. Survey Details
    surveyDate: {
        type: Date,
        required: true
    },
    hasValidCalibration: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },

    // 2. Equipment Settings
    appliedCurrent: { type: String, trim: true },
    appliedVoltage: { type: String, trim: true },
    exposureTime: { type: String, trim: true },
    workload: { type: String, trim: true },

    // 3. Dynamic table rows
    locations: [LocationSchema],

    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        index: true,
    },

    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceReport",
        index: true,
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` on every save
RadiationProtectionSurveySchema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

RadiationProtectionSurveySchema.pre('updateOne', function (next) {
    this.set({ updatedAt: Date.now() });
    next();
});

RadiationProtectionSurveySchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance
RadiationProtectionSurveySchema.index({ serviceId: 1 }, { unique: true });

export default mongoose.models.RadiationProtectionSurveyDentalIntra ||
    mongoose.model("RadiationProtectionSurveyDentalIntra", RadiationProtectionSurveySchema);
