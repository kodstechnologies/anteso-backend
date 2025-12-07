// models/CentralBeamAlignment.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// Main Schema
const CentralBeamAlignmentSchema = new Schema(
    {
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

        // Technique Factors (Single fixed row)
        techniqueFactors: {
            fcd: { type: Number },     // cm
            kv: { type: Number },
            mas: { type: Number },
        },

        // Observed Tilt (Single measurement)
        observedTilt: {
            operator: { type: String },   // <, >, <=, >=, =
            value: { type: Number },      // degrees
            remark: { type: String },     // Pass / Fail / empty
        },

        // Tolerance (Acceptance Criteria)
        tolerance: {
            operator: { type: String },   // <, >, <=, >=, =
            value: { type: Number },      // degrees
        },

        // Final Result
        finalResult: {
            type: String, // PASS / FAIL / PENDING
        },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

CentralBeamAlignmentSchema.index({ serviceId: 1 }, { unique: true });

export default mongoose.model("CentralBeamAlignmentRadiographyMobileHT", CentralBeamAlignmentSchema);
