// models/AlignmentOfTableGantry.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const AlignmentOfTableGantrySchema = new Schema(
  {
    result: {
      type: String,
      default: '',
      trim: true,
    },
    toleranceSign: {
      type: String,
      enum: ['+', '-', '±'],
      default: '±',
      trim: true,
    },
    toleranceValue: {
      type: String,
      default: '2',
      trim: true,
    },
    remark: {
      type: String,
      default: '',
      trim: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    serviceReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'alignmentoftablegantryctscan',
  }
);

// Indexes for performance
AlignmentOfTableGantrySchema.index({ serviceId: 1 });
AlignmentOfTableGantrySchema.index({ serviceReportId: 1 });

const AlignmentOfTableGantry = model('AlignmentOfTableGantryCTScan', AlignmentOfTableGantrySchema);

export default AlignmentOfTableGantry;

