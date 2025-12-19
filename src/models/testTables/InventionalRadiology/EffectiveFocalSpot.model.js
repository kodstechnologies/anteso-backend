// models/EffectiveFocalSpot.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const EffectiveFocalSpotSchema = new Schema(
    {
        // Reference to Service
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
            required: true,
            index: true,
        },
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
            index: true,
        },
        // FCD (Focal Spot Distance in cm)
        fcd: {
            type: Number,
            required: true,
        },

        // Editable Tolerance Criteria (from header inputs)
        toleranceCriteria: {
            small: {
                multiplier: { type: Number, required: true },    // e.g. 0.5
                upperLimit: { type: Number, required: true },    // e.g. 0.8
            },
            medium: {
                multiplier: { type: Number, required: true },    // e.g. 0.4
                lowerLimit: { type: Number, required: true },    // e.g. 0.8
                upperLimit: { type: Number, required: true },    // e.g. 1.5
            },
            large: {
                multiplier: { type: Number, required: true },    // e.g. 0.3
                lowerLimit: { type: Number, required: true },    // e.g. 1.5 (meaning > this value)
            },
        },

        // Focal Spot Measurements
        focalSpots: [
            {
                focusType: {
                    type: String,
                    required: true,
                },
                statedWidth: {
                    type: Number,
                    required: true,
                },
                statedHeight: {
                    type: Number,
                    required: true,
                },
                measuredWidth: {
                    type: Number,
                },
                measuredHeight: {
                    type: Number,
                },
                remark: {
                    type: String,
                },
            },
        ],

        // Final Result
        finalResult: {
            type: String,
            required: true,
        },

        // Tube ID for double tube support (frontal/lateral)
        tubeId: {
            type: String,
            enum: [null, 'frontal', 'lateral'],
            default: null,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// One test per service and tube
EffectiveFocalSpotSchema.index({ serviceId: 1, tubeId: 1 }, { unique: true });

export default mongoose.models.EffectiveFocalSpotInventionalRadiology ||
    mongoose.model("EffectiveFocalSpotInventionalRadiology", EffectiveFocalSpotSchema);
