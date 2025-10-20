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

// Manufacturer Schema
const ManufacturerSchema = new Schema(
    {
        contactPersonName: { type: String, trim: true },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        pincode: {
            type: String,
        },
        address:{
            type:String
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
        services: {
            type: [String], // e.g. ["Installation", "Maintenance", "Support"]
            default: [],
        },
        travelCost: {
            type: String,
            enum: ["Actual Cost", "Fixed Cost"],
        },
        cost: {
            type: Number, // ✅ optional cost field
            required: false,
        }, 
    },
    { timestamps: true }
);
ManufacturerSchema.plugin(createdByPlugin);

const Manufacturer = User.discriminator("Manufacturer", ManufacturerSchema);

export default Manufacturer;