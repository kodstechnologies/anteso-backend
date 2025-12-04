import mongoose from "mongoose";

const table1RowSchema = new mongoose.Schema({
    fcd: { type: String, required: false }, // Focal Center Distance (cm)
    kv: { type: String, required: false },
    time:{ type: String, required: false}
});

const table2RowSchema = new mongoose.Schema({
    mAsApplied: { type: String, required: false },
    measuredOutputs: { type: [String], default: [] }, // Dynamic measured values
    average: { type: String },
    x: { type: String },
    xMax: { type: String },
    xMin: { type: String },
    col: { type: String },
    remarks: { type: String },
});

const linearityOfmAsLoadingSchema = new mongoose.Schema(
    {
        testName: {
            type: String,
           
        },

        // First table: FCD & kV
        table1: {
            type: [table1RowSchema],
            default: [],
        },

        // Second table: dynamic radiation measurements and computed results
        table2: {
            type: [table2RowSchema],
            default: [],
        },

        // Column headers for dynamic radiation output columns
        measHeaders: {
            type: [String],
            default: [],
        },

        // Tolerance entered by user
        tolerance: {
            type: String,
            default: "0.1",
        },

        // Optional: associate with a QA Report or order
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

export default mongoose.model("LinearityOfmAsLoadingRadiographyFixed", linearityOfmAsLoadingSchema);
