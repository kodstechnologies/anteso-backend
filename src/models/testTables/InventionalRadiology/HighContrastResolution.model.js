import mongoose from "mongoose";

const HighContrastResolutionSchema = new mongoose.Schema(
  {
    measuredLpPerMm: {
      type: String,
      trim: true,
      default: "",
    },

    recommendedStandard: {
      type: String,
      trim: true,
      default: "1.50",
    },

    tolerance: {
      type: String,
      trim: true,
      default: "",
    },

    remark: {
      type: String,
      default: "",
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
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

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

HighContrastResolutionSchema.index({ reportId: 1 });
HighContrastResolutionSchema.index({ serviceId: 1, reportId: 1 });
HighContrastResolutionSchema.index({ reportId: 1, isDeleted: 1 });
HighContrastResolutionSchema.index({ serviceId: 1, tubeId: 1 });

const HighContrastResolution = mongoose.models.HighContrastResolutionInventionalRadiology ||
  mongoose.model("HighContrastResolutionInventionalRadiology", HighContrastResolutionSchema);

export default HighContrastResolution;