// models/LinearityOfMasLoading.js
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

// ===================== Table 2: mAs Linearity Measurements =====================
const Table2RowSchema = new Schema({
  ma: { 
    type: String, 
    required: true, 
    trim: true,
    default: '' 
  }, // mAs value (e.g., 50, 100, 200)

  measuredOutputs: [
    { 
      type: String, 
      trim: true, 
      default: '' 
    }
  ], // Dynamic array: Output (mGy) for each measurement

  // Auto-calculated fields (stored for reporting & consistency)
  average: { type: String, default: '', trim: true },        // Avg Output (mGy)
  x: { type: String, default: '', trim: true },              // X = Output / mAs
  xMax: { type: String, default: '', trim: true },           // Global X MAX
  xMin: { type: String, default: '', trim: true },           // Global X MIN
  col: { type: String, default: '', trim: true },            // Coefficient of Linearity
  remarks: { 
    type: String, 
    default: '' 
  },
});

const LinearityOfMasLoadingSchema = new Schema(
  {
    // Table 1: Single settings row
    table1: {
      type: Table1RowSchema,
      required: true,
    },

    // Table 2: Array of mAs linearity test rows
    table2: [Table2RowSchema],

    // Tolerance for CoL (e.g., 0.1)
    tolerance: {
      type: String,
      default: '0.1',
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
    tubeId: {
      type: String,
      enum: [null, 'A', 'B'],
      default: null,
      required: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    collection: 'linearityofmasloadingctscan', // Optional: explicit collection name
  }
);

// Indexes for performance
LinearityOfMasLoadingSchema.index({ serviceId: 1, testId: 1 });
LinearityOfMasLoadingSchema.index({ serviceReportId: 1 });
LinearityOfMasLoadingSchema.index({ serviceId: 1, tubeId: 1 });

// Prevent model recompilation in development (Next.js hot reload)
const LinearityOfMasLoading =
  model('LinearityOfMasLoadingCTScan', LinearityOfMasLoadingSchema);

export default LinearityOfMasLoading;

