// models/counter.model.js
import mongoose from 'mongoose';
import createdByPlugin from './plugins/createdBy.plugin.js';

const counterSchema = new mongoose.Schema({
    entity: { type: String, required: true, unique: true },
    seq: { type: Number, default: 0 }
});

export default mongoose.model('Counter', counterSchema);
