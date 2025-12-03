// models/LinearityOfMaLoading.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// ===================== Table 1: FCD, kV, Time (sec) =====================
const Table1RowSchema = new Schema({
  fcd: { 
    type: String, 
    required: true, 
    trim: true,
    default: '' 
  }, // FCD (cm)
  kv: { 
    type: String, 
    required: true, 
    trim: true,
    default: '' 
  }, // kV
  time: { 
    type: String, 
    required: true, 
    trim: true,
    default: '' 
  }, // Time in seconds
});

// ===================== Table 2: mA Linearity Measurements =====================
const Table2RowSchema = new Schema({
  ma: { 
    type: String, 
    required: true, 
    trim: true,
    default: '' 
  }, // mA value (e.g., 50, 100, 200)

  measuredOutputs: [
    { 
      type: String, 
      trim: true, 
      default: '' 
    }
  ], // Dynamic array: Output (mGy) for each measurement

  // Auto-calculated fields (stored for reporting & consistency)
  average: { type: String, default: '', trim: true },        // Avg Output (mGy)
  x: { type: String, default: '', trim: true },              // X = Output / mA
  xMax: { type: String, default: '', trim: true },           // Global X MAX
  xMin: { type: String, default: '', trim: true },           // Global X MIN
  col: { type: String, default: '', trim: true },            // Coefficient of Linearity
  remarks: { 
    type: String, 
    default: '' 
  },
});

const LinearityOfMaLoadingSchema = new Schema(
  {
    // Table 1: Single settings row
    table1: {
      type: Table1RowSchema,
      required: true,
    },

    // Table 2: Array of mA linearity test rows
    table2: [Table2RowSchema],

    // Tolerance for CoL (e.g., 0.1)
    tolerance: {
      type: String,
      default: '',
      trim: true,
    },

    // References
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

    testId: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined while keeping uniqueness for saved tests
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Indexes for performance
LinearityOfMaLoadingSchema.index({ serviceId: 1 }, { unique: true });
LinearityOfMaLoadingSchema.index({ serviceReportId: 1 });

// Prevent model recompilation in development
const LinearityOfMaLoading =
  model('LinearityOfMaLoadingOPG', LinearityOfMaLoadingSchema);

export default LinearityOfMaLoading;

