import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Alignment Test Row Schema
const AlignmentTestRowSchema = new Schema({
  testName: {
    type: String,
  
  },
  sign: {
    type: String,
  
  },
  value: {
    type: String,
  
  },
});

// Main Alignment Test Schema
const AlignmentTestSchema = new Schema(
  {
    testRows: [AlignmentTestRowSchema],
    serviceReportId: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceReport',
      required: false,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for performance
AlignmentTestSchema.index({ serviceReportId: 1 });
AlignmentTestSchema.index({ serviceId: 1 });

// Update the `updatedAt` field on save
AlignmentTestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

AlignmentTestSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

AlignmentTestSchema.pre('updateOne', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const AlignmentTest = model(
  'AlignmentTestOBI',
  AlignmentTestSchema
);

export default AlignmentTest;
