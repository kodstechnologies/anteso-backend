import mongoose from "mongoose";
import User from "../models/user.model.js";
import createdByPlugin from "./plugins/createdBy.plugin.js";
import { generateReadableId } from "../utils/generateReadableId.js"; // ✅ import helper

const { Schema } = mongoose;

// ─────────────────────────────
// QA Test Sub-schema
// ─────────────────────────────
const qaTestSchema = new Schema({
    testName: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
    },
});

// ─────────────────────────────
// Dealer Schema
// ─────────────────────────────
const DealerSchema = new Schema(
    {
        // ✅ New readable dealer ID field
        dealerId: {
            type: String,
            unique: true,
            index: true,
        },

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
        address: {
            type: String,
        },
    },
    { timestamps: true }
);

// ─────────────────────────────
// Plugin
// ─────────────────────────────
DealerSchema.plugin(createdByPlugin);

// ─────────────────────────────
// Pre-save Hook for Readable Dealer ID
// ─────────────────────────────
DealerSchema.pre("save", async function (next) {
    // Only generate if not already set (avoid regenerating on updates)
    if (!this.dealerId) {
        try {
            // Generate something like "DLR001", "DLR002", ...
            const readableId = await generateReadableId("Dealer", "DEL");
            this.dealerId = readableId;
        } catch (err) {
            console.error("❌ Error generating Dealer ID:", err);
            return next(err);
        }
    }
    next();
});


const Dealer = User.discriminator("Dealer", DealerSchema);
export default Dealer;
