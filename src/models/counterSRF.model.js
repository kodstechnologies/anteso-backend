// models/counterSRF.model.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    prefix: { type: String, required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    sequenceValue: { type: Number, default: 0 },
});

// ✅ Ensure unique per prefix+year+month combo
// counterSchema.index({ prefix: 1, year: 1, month: 1 }, { unique: true });

export default mongoose.model("CounterSRF", counterSchema);
