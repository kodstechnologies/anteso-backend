import mongoose from 'mongoose';

const { Schema } = mongoose;

const leaveAllocationSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    year: { type: Number, required: true },
    /** Annual leaves set by admin (allocate-leaves-all) */
    allocatedLeaves: { type: Number, default: 0 },
    /** Earned comp off (e.g. Saturday login / working Saturday) */
    compOffLeaves: { type: Number, default: 0 },
    /** Total leave pool = allocatedLeaves + compOffLeaves (kept in sync in code) */
    totalLeaves: { type: Number, required: true },
    usedLeaves: { type: Number, default: 0 },
    /** Prevent double comp-off credit for the same calendar day */
    compOffLastCreditedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

leaveAllocationSchema.index({ employee: 1, year: 1 }, { unique: true });

export const LeaveAllocation = mongoose.model('LeaveAllocation', leaveAllocationSchema);