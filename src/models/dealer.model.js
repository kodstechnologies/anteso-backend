import mongoose from "mongoose";
import User from "../models/user.model.js";

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

const Dealer = User.discriminator("Dealer", DealerSchema);

export default Dealer;
