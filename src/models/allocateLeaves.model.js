import mongoose from 'mongoose';

const { Schema } = mongoose;

const leaveAllocationSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    year: { type: Number, required: true },
    totalLeaves: { type: Number, required: true },
    usedLeaves: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leaveAllocationSchema.index({ employee: 1, year: 1 }, { unique: true });

export const LeaveAllocation = mongoose.model('LeaveAllocation', leaveAllocationSchema);