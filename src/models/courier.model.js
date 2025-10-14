import mongoose from "mongoose";

const courierSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
        },
        courierCompanyName: {
            type: String,
            required: true,
            trim: true,
        },
        trackingId: {
            type: String,
            required: false,
            default: null,
        },
        trackingUrl: {
            type: String,
            required: false,
            default: null,
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

const Courier = mongoose.model("Courier", courierSchema);

export default Courier;