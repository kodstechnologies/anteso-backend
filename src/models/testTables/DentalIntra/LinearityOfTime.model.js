// models/LinearityOfTime.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

const Table1RowSchema = new Schema({
  fcd: { type: String, required: true, trim: true },
  kv: { type: String, required: true, trim: true },
  ma: { type: String, required: true, trim: true }, // Fixed mA
});

const Table2RowSchema = new Schema({
  time: { type: String, required: true, trim: true }, // Exposure time in sec
  measuredOutputs: [{ type: String, trim: true }],
  average: { type: String, default: '' },
  x: { type: String, default: '' },           // mGy/sec
  xMax: { type: String, default: '' },
  xMin: { type: String, default: '' },
  col: { type: String, default: '' },
  remarks: { type: String, enum: ['Pass', 'Fail', ''], default: '' },
});

const LinearityOfTimeSchema = new Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  serviceReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceReport', index: true },

  table1: { type: Table1RowSchema, required: true },
  table2: [Table2RowSchema],

  tolerance: { type: String, default: '0.1', trim: true },
  testId: { type: String, unique: true, sparse: true },
}, { timestamps: true, collection: 'linearityoftime' });

LinearityOfTimeSchema.index({ serviceId: 1, testId: 1 });

const LinearityOfTime = mongoose.model('LinearityOfTimeDentalIntra', LinearityOfTimeSchema);
export default LinearityOfTime;