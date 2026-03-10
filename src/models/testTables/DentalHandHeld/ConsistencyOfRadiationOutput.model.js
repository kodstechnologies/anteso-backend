import mongoose from 'mongoose';

const OutputMeasurementSchema = new mongoose.Schema({
    value: { type: String, trim: true },
});

const OutputRowSchema = new mongoose.Schema({
    kv: { type: String, trim: true },
    mas: { type: String, trim: true },
    outputs: [OutputMeasurementSchema],
    avg: { type: String, trim: true },
    cov: { type: String, trim: true },
    remark: { type: String, trim: true },
});

const ConsistencyOfOutputSchema = new mongoose.Schema(
    {
        ffd: { type: String, trim: true, default: "" },
        outputRows: [OutputRowSchema],
        measurementHeaders: [{ type: String }],
        tolerance: {
            operator: { type: String, trim: true, default: "<=" },
            value: { type: String, trim: true }
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
        },
        reportId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceReport',
        },
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const ConsistencyOfRadiationOutput = mongoose.model('ConsistencyOfRadiationOutputDentalHandHeld', ConsistencyOfOutputSchema);
export default ConsistencyOfRadiationOutput;
