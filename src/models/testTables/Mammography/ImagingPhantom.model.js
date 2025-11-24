// models/ImagingPhantom.js
import mongoose from "mongoose";

const ImagingPhantomSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
   
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceReport',
    },

    // Array of phantom objects (Fibers, Microcalcifications, custom ones, etc.)
    rows: [
        {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            visibleCount: {
                type: Number,
                required: true,
                min: 0,
            },
            tolerance: {
                operator: {
                    type: String,
                    enum: [">", ">=", "<", "<=", "="],
                    required: true,
                },
                value: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        },
    ],

    // Internal remark: "Pass" or "Fail" based on tolerance check (not shown in UI)
    remark: {
        type: String,
        enum: ["Pass", "Fail"],
        required: true,
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update `updatedAt` on save
ImagingPhantomSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Index for better query performance
ImagingPhantomSchema.index({ serviceId: 1 });

export default mongoose.models.ImagingPhantom ||
    mongoose.model("ImagingPhantom", ImagingPhantomSchema);