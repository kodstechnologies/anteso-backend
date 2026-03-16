import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const ToleranceSchema = new mongoose.Schema({
    value: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'kvp', 'absolute'], default: 'percent' },
    sign: { type: String, enum: ['plus', 'minus', 'both'], default: 'both' },
}, { _id: false });

// Table 2 Row: dynamic mA columns via ma (object keyed by label)
const Table2RowSchema = new Schema({
    setKV: { type: Schema.Types.Mixed, default: '' },
    ma: { type: Schema.Types.Mixed, default: {} },
    avgKvp: { type: Schema.Types.Mixed, default: '' },
    remarks: { type: String, default: '', trim: true },
}, { _id: false });

const AccuracyOfOperatingPotentialSchema = new Schema(
    {
        maColumnLabels: { type: [String], default: ['10', '100', '200'] },
        table2: [Table2RowSchema],
        tolerance: { type: ToleranceSchema, required: true },
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
        reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceReport' },
        tubeId: { type: String, enum: [null, 'frontal', 'lateral'], default: null },
    },
    { timestamps: true }
);

AccuracyOfOperatingPotentialSchema.index({ serviceId: 1, tubeId: 1 });
AccuracyOfOperatingPotentialSchema.index({ reportId: 1 });

export default model('AccuracyOfOperatingPotentialInventionalRadiology', AccuracyOfOperatingPotentialSchema);
