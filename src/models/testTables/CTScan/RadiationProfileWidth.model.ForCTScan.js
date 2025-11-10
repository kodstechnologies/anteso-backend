// models/RadiationProfileWidth.mjs
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const Table1RowSchema = new Schema({
    kvp: {
        type: String,

    },
    ma: {
        type: String,

    },
});

const Table2RowSchema = new Schema({
    applied: {
        type: String,

    },
    measured: {
        type: String,

    },
    tolerancePlus: {
        type: String,

    },
    toleranceMinus: {
        type: String,

    },
    remarks: {
        type: String,

    },
});

// Main Schema
const RadiationProfileWidthSchema = new Schema(
    {
        table1: [Table1RowSchema],
        table2: [Table2RowSchema],

        // Optional: Link to parent report
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
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Index for performance
RadiationProfileWidthSchema.index({ serviceReportId: 1 });

// Export model
const RadiationProfileWidth = model('RadiationProfileWidthForCTScan', RadiationProfileWidthSchema);

export default RadiationProfileWidth;