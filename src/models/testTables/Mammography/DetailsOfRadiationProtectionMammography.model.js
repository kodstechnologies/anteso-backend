// models/DetailsOfRadiationProtectionMammography.js
import mongoose from "mongoose";

const detailsOfRadiationProtectionMammographySchema = new mongoose.Schema(
    {
        // Links to the Service (one per machine/service)
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
            index: true, // for fast lookup by serviceId
        },

        // Optional: link to ServiceReport if you want to attach it later
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
            index: true,
        },

        // From your frontend
        surveyDate: {
            type: Date,        // Store as Date, not string (best practice)
            required: false,
        },

        hasValidCalibration: {
            type: String,
           
            trim: true,
        },

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