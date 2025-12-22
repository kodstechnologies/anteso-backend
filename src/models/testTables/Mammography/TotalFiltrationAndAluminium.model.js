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
            remarks: { type: String, enum: ['Pass', 'Fail', ''], default: '', trim: true },
            recommendedValue: {
                minValue: { type: Number, default: null },
                maxValue: { type: Number, default: null },
                kvp: { type: Number, default: null },
            },
        },
    ],

    // Result
    resultHVT28kVp: {
        type: Number,
        default: null,
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