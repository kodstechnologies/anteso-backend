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
        multiplier: { type: Number },    // e.g. 0.5
        upperLimit: { type: Number },    // e.g. 0.8
      },
      medium: {
        multiplier: { type: Number },    // e.g. 0.4
        lowerLimit: { type: Number },    // e.g. 0.8
        upperLimit: { type: Number },    // e.g. 1.5
      },
      large: {
        multiplier: { type: Number },    // e.g. 0.3
        lowerLimit: { type: Number },    // e.g. 1.5 (meaning > this value)
      },
    },

    // Focal Spot Measurements
    focalSpots: [
      {
        focusType: {
          type: String,
          
        },
        statedWidth: {
          type: Number,
        },
        statedHeight: {
          type: Number,
      
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
  },
  {
    timestamps: true,
  }
);

// One test per service
EffectiveFocalSpotSchema.index({ serviceId: 1 }, { unique: true });

export default mongoose.models.EffectiveFocalSpotRadiographyMobileHT ||
  mongoose.model("EffectiveFocalSpotRadiographyMobileHT", EffectiveFocalSpotSchema);
