import mongoose from "mongoose";

const table1RowSchema = new mongoose.Schema({
    fcd: { type: String, required: false },
    kv: { type: String, required: false },
    time: { type: String, required: false },
});

const table2RowSchema = new mongoose.Schema({
    ma: { type: String, required: false },
    mAsApplied: { type: String, required: false },
    measuredOutputs: { type: [mongoose.Schema.Types.Mixed], default: [] },
    average: { type: String },
    x: { type: String },
    xMax: { type: String },
    xMin: { type: String },
    col: { type: String },
    remarks: { type: String },
});

const linearityOfMaLoadingSchema = new mongoose.Schema(
    {
        testName: { type: String },
        table1: { type: [table1RowSchema], default: [] },
        table2: { type: [table2RowSchema], default: [] },
        measHeaders: { type: [String], default: [] },
        tolerance: { type: String, default: "0.1" },
        toleranceOperator: { type: String, default: "<=" },
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ServiceReport",
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("LinearityOfMaLoadingCArm", linearityOfMaLoadingSchema);
