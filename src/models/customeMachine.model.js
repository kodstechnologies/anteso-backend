import mongoose, { Schema } from 'mongoose';
const customMachineSchema = new Schema({
    name: {
        type: String,
    },
    code: {
        type: String,
    },

});

export const CustomMachine = mongoose.model('CustomMachine', customMachineSchema);
