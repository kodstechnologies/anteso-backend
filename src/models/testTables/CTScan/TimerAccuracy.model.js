// models/TimerAccuracy.mjs
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Table 1 Row
const Table1RowSchema = new Schema({
    kvp: { type: String, default: '', trim: true },
    sliceThickness: { type: String, default: '', trim: true },
    ma: { type: String, default: '', trim: true },
});

// Table 2 Row
const Table2RowSchema = new Schema({
    setTime: { type: String, default: '', trim: true },
    observedTime: { type: String, default: '', trim: true },
    percentError: { type: String, default: '', trim: true },
    remarks: { type: String, default: '', trim: true },
});

// Main Schema
const TimerAccuracySchema = new Schema(
    {
        table1: [Table1RowSchema],
        table2: [Table2RowSchema],
        tolerance: { type: String, default: '', trim: true },
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

TimerAccuracySchema.index({ serviceReportId: 1 });
TimerAccuracySchema.index({ serviceId: 1, tubeId: 1 });

const TimerAccuracy = model('TimerAccuracy', TimerAccuracySchema);

export default TimerAccuracy;