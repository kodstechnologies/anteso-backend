import mongoose, { Schema } from "mongoose";

const trackExpenseItemSchema = new Schema(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
        expenses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Expense",
            },
        ],
        trip: {
            type: Schema.Types.ObjectId,
            ref: "Trip",
        },
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
        },
        machineType: {
            type: String,
            trim: true,
        },
        technician: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
        },
    machineCount: {
        type: Number,
        default: 1,
    },
        cost: {
            type: Number,
            default: 0,
        },
        qaTestDoneAt: {
            type: Date,
        },
        totalRequiredAmount: {
            type: Number,
            default: 0,
        },
    },
    { _id: true }
);

const trackExpenseSchema = new Schema(
    {
        technician: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        expenses: [
            {
                type: Schema.Types.ObjectId,
                ref: "Expense",
            },
        ],
        trips: [
            {
                type: Schema.Types.ObjectId,
                ref: "Trip",
            },
        ],
        items: [trackExpenseItemSchema],
        noOfMachines: {
            type: Number,
            default: 0,
        },
        totalRequiredAmount: {
            type: Number,
            default: 0,
        },
        cost: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

trackExpenseSchema.index({ technician: 1, date: 1 }, { unique: true });

export default mongoose.model("TrackExpense", trackExpenseSchema);
