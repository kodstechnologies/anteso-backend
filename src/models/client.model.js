import mongoose from 'mongoose';
import User from './user.model.js';
import { generateReadableId } from '../utils/GenerateReadableId.js';
import createdByPlugin from './plugins/createdBy.plugin.js';
const { Schema } = mongoose;

const clientSchema = new Schema({
    clientId: {
        type: String,
        unique: true,
        index: true,
    },
    gstNo: {
        type: String,
    },
    address:{
        type:String
        
    },
    hospitals: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Hospital',
            default: [],
        },
    ],
    // machines:
    // {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Machine',
    // },
    // models/customer.model.js
    enquiries: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Enquiry",
        }
    ],

});
clientSchema.plugin(createdByPlugin);

// Generate clientId like CL001 before saving
clientSchema.pre('save', async function (next) {
    if (!this.clientId) {
        this.clientId = await generateReadableId('Client', 'CL');
    }
    next();
});

const Client = User.discriminator('Customer', clientSchema);

export default Client;