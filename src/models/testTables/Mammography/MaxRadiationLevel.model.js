// models/MaximumRadiationLevel.js
import mongoose from "mongoose";

const locationReadingSchema = new mongoose.Schema({
    location: {
        type: String,
        required: true,
        enum: [
            "Control Console (Operator Position)",
            "Behind Lead Glass",
            "Technician Entrance Door",
            "Outside Patient Entrance Door",
            "Patient Waiting Area",
        ],
    },
    mRPerHr: {
        type: String,        // Store as string to preserve exact input (e.g. "0.123")
        default: "",
    },
    result: {
        type: String,
        enum: ["Pass", "Fail", ""],
        default: "",
    },
}, { _id: false });

const maximumRadiationLevelSchema = new mongoose.Schema(
    {
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
            unique: true,           // Only ONE record per service/machine
            index: true,
        },

        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
            index: true,
        },

        // Array of exactly 5 fixed locations
        readings: {
            type: [locationReadingSchema],
            validate: [
                (v) => v.length === 5,
                "Exactly 5 location readings are required"
            ],
        },

        // Auto-calculated max weekly dose (optional: store for reporting)
        maxWeeklyDose: {
            type: String,
            default: "0.000",
        },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Auto-update updatedAt
maximumRadiationLevelSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model("MaximumRadiationLevel", maximumRadiationLevelSchema);