import mongoose from "mongoose";
import User from "../models/user.model.js";
import createdByPlugin from "./plugins/createdBy.plugin.js";

const { Schema } = mongoose;

const qaTestSchema = new Schema({
    testName: {
        type: String,

        trim: true,
    },
    price: {
        type: Number,
    },
});

// Dealer Schema
const DealerSchema = new Schema(
    {
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        pincode: {
            type: String,
        },
        branch: {
            type: String,
        },
        mouValidity: {
            type: Date,
        },
        qaTests: {
            type: [qaTestSchema],
            default: [],
        },
    },
    { timestamps: true }
);
DealerSchema.plugin(createdByPlugin);

const Dealer = User.discriminator("Dealer", DealerSchema);

export default Dealer;
