// utils/generateSRFNumber.js
import Counter from '../models/counterSRF.model.js';

export const genarateSRFNumber = async () => {
  const prefix = 'ABSRF';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  // Atomically increment or create counter
  const counter = await Counter.findOneAndUpdate(
    { prefix, year, month },
    { $inc: { sequenceValue: 1 } },
    { new: true, upsert: true } // create if doesn't exist
  );

  const nextNumber = String(counter.sequenceValue).padStart(4, '0');
  return `${prefix}/${year}/${String(month).padStart(2, '0')}/${nextNumber}`;
};
