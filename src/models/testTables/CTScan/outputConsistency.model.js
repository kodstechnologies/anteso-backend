import mongoose from "mongoose";

const { Schema } = mongoose;

// Parameters (mAs, slice thickness, time)
const parametersSchema = new Schema({
    mas: { type: String, trim: true },
    sliceThickness: { type: String, trim: true },
    time: { type: String, trim: true },
});

// Each row: kVp + measurements + calculated mean & COV
const outputRowSchema = new Schema({
    kvp: { type: String, trim: true },
    outputs: [{ type: String, trim: true }],  // raw measurements
    mean: { type: String, trim: true },       // calculated mean
    cov: { type: String, trim: true },        // coefficient of variation
});

const OutputConsistencySchema = new Schema(
    {
        parameters: parametersSchema,
        outputRows: [outputRowSchema],
        measurementHeaders: [{ type: String, trim: true }],  // Meas 1, Meas 2...
        tolerance: { type: String, trim: true, default: "" },

        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        reportId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceReport",
        },
    },
    { timestamps: true }
);

OutputConsistencySchema.index({ serviceId: 1 });

export default mongoose.model("OutputConsistency", OutputConsistencySchema);