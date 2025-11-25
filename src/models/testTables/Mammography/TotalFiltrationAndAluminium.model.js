import mongoose from "mongoose";

const TotalFilterationAndAlluminiumSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ServiceReport',
    },
    // Anode/Filter & Added Filtration
    targetWindow: {
        type: String,
        required: true,
        trim: true,
    },
    addedFilterThickness: {
        type: String,
        default: null,
        trim: true,
    },

    // HVT Measurement Table
    table: [
        {
            kvp: { type: Number, default: null },
            mAs: { type: Number, default: null },
            alEquivalence: { type: Number, default: null }, // mm Al
            hvt: { type: Number, default: null },           // mm Al
        },
    ],

    // Result
    resultHVT28kVp: {
        type: Number,
        default: null,
    },

    // Recommended HVL Tolerances (with operator)
    hvlTolerances: {
        at30: {
            operator: { type: String, default: ">=" },
            value: { type: Number, default: null },
        },
        at40: {
            operator: { type: String, default: ">=" },
            value: { type: Number, default: null },
        },
        at50: {
            operator: { type: String, default: ">=" },
            value: { type: Number, default: null },
        },
    },

    // Metadata
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update the `updatedAt` field on save
TotalFilterationAndAlluminiumSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.models.TotalFilterationAndAlluminium ||
    mongoose.model("TotalFilterationAndAlluminiumMammography", TotalFilterationAndAlluminiumSchema);