// models/testTables/OArm/AccuracyOfIrradiationTime.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AccuracyOfIrradiationTimeSchema = new Schema({
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },

  testConditions: {
    fcd: { type: String, default: '' },
    kv: { type: String, default: '' },
    ma: { type: String, default: '' },
  },

  irradiationTimes: [
    {
      setTime: { type: String, default: '' },
      measuredTime: { type: String, default: '' },
    },
  ],

  tolerance: {
    operator: { type: String, default: '<=' },
    value: { type: String, default: '' },
  },

  reportId: { type: Schema.Types.ObjectId, ref: 'ServiceReport' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AccuracyOfIrradiationTimeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

AccuracyOfIrradiationTimeSchema.index({ serviceId: 1 });
AccuracyOfIrradiationTimeSchema.index({ reportId: 1 });

const AccuracyOfIrradiationTimeOArm = model(
  'AccuracyOfIrradiationTimeOArm',
  AccuracyOfIrradiationTimeSchema
);

export default AccuracyOfIrradiationTimeOArm;
