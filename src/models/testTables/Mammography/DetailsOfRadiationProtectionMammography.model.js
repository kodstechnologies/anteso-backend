// models/DetailsOfRadiationProtectionMammography.js
import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        trim: true,
    },
    mRPerHr: {
        type: String,
        trim: true,
    },
    mRPerWeek: {
        type: String,
        trim: true
    },
    result: {
        type: String,
        trim: true,
    },
    calculatedResult: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        trim: true
    },
});

const detailsOfRadiationProtectionMammographySchema = new mongoose.Schema(
    {
        // Links to the Service (one per machine/service)
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
            index: true,
        },

        // Optional: link to ServiceReport
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
            index: true,
        },

        // Survey Details
        surveyDate: {
            type: Date,
            required: false,
        },
        hasValidCalibration: {
            type: String,
            trim: true,
        },

        // Equipment Settings
        appliedCurrent: { type: String, trim: true },
        appliedVoltage: { type: String, trim: true },
        exposureTime: { type: String, trim: true },
        workload: { type: String, trim: true },

        // Dynamic location rows
        locations: [LocationSchema],

        // Optional metadata
        hospitalName: { type: String, trim: true },
        equipmentId: { type: String, trim: true },
        roomNo: { type: String, trim: true },
        manufacturer: { type: String, trim: true },
        model: { type: String, trim: true },
        surveyorName: { type: String, trim: true },
        surveyorDesignation: { type: String, trim: true },
        remarks: { type: String, trim: true },

        // Audit fields
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

detailsOfRadiationProtectionMammographySchema.index(
    { serviceId: 1 },
    { unique: true }
);

// Auto-update updatedAt on save
detailsOfRadiationProtectionMammographySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model(
    "DetailsOfRadiationProtectionMammography",
    detailsOfRadiationProtectionMammographySchema
);
