import mongoose from "mongoose";
import User from "../models/user.model.js";
import createdByPlugin from "./plugins/createdBy.plugin.js";
import { generateReadableId } from "../utils/generateReadableId.js";

const { Schema } = mongoose;

// ─────────────────────────────────────────────
// Sub-schema for QA Tests
// ─────────────────────────────────────────────
const qaTestSchema = new Schema({
    testName: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
    },
});

// ─────────────────────────────────────────────
// Sub-schema for Services
// ─────────────────────────────────────────────
const serviceSchema = new Schema({
    serviceName: {
        type: String,
        trim: true,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
});

// ─────────────────────────────────────────────
// Manufacturer Schema
// ─────────────────────────────────────────────
const ManufacturerSchema = new Schema(
    {
        // 👇 New readable ID field
        manufacturerId: {
            type: String,
            unique: true,
            index: true,
        },

        contactPersonName: { type: String, trim: true },
        city: { type: String },
        state: { type: String },
        pincode: { type: String },
        address: { type: String },
        branch: { type: String },
        mouValidity: { type: Date },

        qaTests: {
            type: [qaTestSchema],
            default: [],
        },

        services: {
            type: [serviceSchema],
            default: [],
        },

        travelCost: {
            type: String,
            enum: ["Actual Cost", "Fixed Cost"],
        },

        cost: {
            type: Number,
            required: false,
        },
    },
    { timestamps: true }
);

// ─────────────────────────────────────────────
// Plugin
// ─────────────────────────────────────────────
ManufacturerSchema.plugin(createdByPlugin);

// ─────────────────────────────────────────────
// Pre-save Hook to Generate Readable ID
// ─────────────────────────────────────────────
ManufacturerSchema.pre("save", async function (next) {
    // Only generate if not already assigned (prevents duplicates on update)
    if (!this.manufacturerId) {
        try {
            const readableId = await generateReadableId("Manufacturer", "MANU");
            this.manufacturerId = readableId;
        } catch (err) {
            console.error("Error generating Manufacturer ID:", err);
            return next(err);
        }
    }
    next();
});


const Manufacturer = User.discriminator("Manufacturer", ManufacturerSchema);

export default Manufacturer;
