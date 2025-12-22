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
    remark: { type: String, enum: ['Pass', 'Fail', ''], default: '' },  // per-row remark
});

const OutputConsistencySchema = new Schema(
    {
        parameters: parametersSchema,
        outputRows: [outputRowSchema],
        tolerance: {
            operator: { 
                type: String, 
                enum: ['<=', '<', '>=', '>'], 
                default: '<=' 
            },
            value: { type: String, trim: true, default: "" },
        },

        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        reportId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceReport",
        },
        tubeId: {
            type: String,
            enum: [null, 'A', 'B'],
            default: null,
            required: false,
        },
    },
    { timestamps: true }
);

OutputConsistencySchema.index({ serviceId: 1 });
OutputConsistencySchema.index({ serviceId: 1, tubeId: 1 });

export default mongoose.model("OutputConsistency", OutputConsistencySchema);