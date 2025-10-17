import mongoose from "mongoose";
import createdByPlugin from "./plugins/createdBy.plugin.js";

const courierSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
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
            enum: ["active", "inactive"],
            default: "active",
        },
    },
    { timestamps: true }
);
courierSchema.plugin(createdByPlugin);

const Courier = mongoose.model("Courier", courierSchema);

export default Courier;