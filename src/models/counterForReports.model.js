import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 3182 },
});

const Counter = mongoose.model("CounterForReport", counterSchema);
export default Counter;
