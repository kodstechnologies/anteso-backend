// models/testTables/CTScan/mainTestTable.model.js
import mongoose from 'mongoose';

const MainTestTableSchema = new mongoose.Schema({

  serviceReportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceReport',
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    index: true,
  },


  srNo: {
    type: [Number],
    required: true,
  },
  parametersTested: {
    type: [String],
    required: true,
    trim: true,
  },
  specifiedValues: {
    type: [String],
    required: true,
    trim: true,
  },
  toleranceOfSliceThickness: {
    type: [String],
    required: true,
    trim: true,
  },
  remarks: {
    type: [String],
    default: [],
    trim: true,
  },
  

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MainTestTableSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});


MainTestTableSchema.index({ serviceId: 1 });

export default mongoose.model('MainTestTable', MainTestTableSchema);