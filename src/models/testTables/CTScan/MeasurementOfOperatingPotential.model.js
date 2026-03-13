import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const ToleranceSchema = new mongoose.Schema({
    value: { type: String, },
    type: { type: String, enum: ['percent', 'kvp', 'absolute'],  },
    sign: { type: String, enum: ['plus', 'minus', 'both'], },
});
// Table 1 Row
const Table1RowSchema = new Schema({
    time: { type: String, default: '', trim: true },
    sliceThickness: { type: String, default: '', trim: true },
});

// Table 2 Row: dynamic mA columns via ma (object keyed by label), legacy ma10/ma100/ma200 kept for backward compat
const Table2RowSchema = new Schema({
    setKV: { type: Schema.Types.Mixed, default: '' }, // number or string
    ma: { type: Schema.Types.Mixed, default: {} },    // e.g. { "10": 80, "100": 81, "200": 79 }
    ma10: { type: String, default: '', trim: true },
    ma100: { type: String, default: '', trim: true },
    ma200: { type: String, default: '', trim: true },
    avgKvp: { type: Schema.Types.Mixed, default: '' },
    deviation: { type: Number, default: null },
    remarks: { type: String, default: '', trim: true },
}, { _id: false });

// Main Schema
const MeasurementOfOperatingPotentialSchema = new Schema(
    {
        table1: [Table1RowSchema],
        maColumnLabels: { type: [String], default: ['10', '100', '200'] },
        table2: [Table2RowSchema],
        tolerance: { type: ToleranceSchema, required: true },
        serviceReportId: {
            type: Schema.Types.ObjectId,
            ref: 'ServiceReport',
            required: false,
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service",
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

MeasurementOfOperatingPotentialSchema.index({ serviceReportId: 1 });
MeasurementOfOperatingPotentialSchema.index({ serviceId: 1, tubeId: 1 });

const MeasurementOfOperatingPotential = model(
    'MeasurementOfOperatingPotential',
    MeasurementOfOperatingPotentialSchema
);

export default MeasurementOfOperatingPotential;