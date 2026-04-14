// models/LinearityOfMasLoading.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const Table1RowSchema = new Schema({
    fcd: { type: String, trim: true },
    kv: { type: String, trim: true },
    time: { type: String, trim: true },
});

const Table2RowSchema = new Schema({
    ma: { type: String, trim: true },
    measuredOutputs: [{ type: String, trim: true }],
    average: { type: String, default: '' },
    x: { type: String, default: '' },           // mGy/mAs
    xMax: { type: String, default: '' },
    xMin: { type: String, default: '' },
    col: { type: String, default: '' },
    remarks: { type: String, enum: ['Pass', 'Fail', ''], default: '' },
});

const LinearityOfMasLoadingSchema = new Schema({
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
    serviceReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceReport', index: true },

    table1: { type: Table1RowSchema },
    table2: [Table2RowSchema],

    tolerance: { type: String, default: '0.1', trim: true },
    toleranceOperator: { type: String, default: '<=', trim: true },
    testId: { type: String, unique: true, sparse: true },
}, { timestamps: true });

const LinearityOfMasLoading = mongoose.model('LinearityOfMasLoadingDentalIntra', LinearityOfMasLoadingSchema);
export default LinearityOfMasLoading;
