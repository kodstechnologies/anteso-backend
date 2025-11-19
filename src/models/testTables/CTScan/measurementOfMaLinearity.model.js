import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Table 1 Row
const Table1RowSchema = new Schema({
    kvp: { type: String, default: '', trim: true },
    sliceThickness: { type: String, default: '', trim: true },
    time: { type: String, default: '', trim: true },
});

// Table 2 Row
const Table2RowSchema = new Schema({
    mAsApplied: { type: String, default: '', trim: true },
    measuredOutputs: [{ type: String, default: '', trim: true }],
    xMax: { type: String, default: '', trim: true },
    xMin: { type: String, default: '', trim: true },
    col: { type: String, default: '', trim: true },
    remarks: { type: String, default: '', trim: true },
    avgOutput: { type: String, default: '', trim: true },
    avgOutput: { type: Number },
});

// Main Schema
const MeasurementOfMaLinearitySchema = new Schema(
    {
        table1: [Table1RowSchema],
        table2: [Table2RowSchema],
        tolerance: { type: String, default: '0.1', trim: true },
        serviceReportId: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceReport',
            required: false,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
        },
    },
    { timestamps: true }
);

MeasurementOfMaLinearitySchema.index({ serviceReportId: 1 });

const MeasurementOfMaLinearity = model('MeasurementOfMaLinearity', MeasurementOfMaLinearitySchema);

export default MeasurementOfMaLinearity;