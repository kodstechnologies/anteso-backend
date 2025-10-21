// models/hospital.model.js

import mongoose from 'mongoose';

const { Schema } = mongoose;

const hospitalSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
        },
        address: {
            type: String,
        },
        branch: {
            type: String,
        },
        phone: {
            type: String,
        },
        gstNo: {
            type: String,
        },
        machines:
        {
            type: Schema.Types.ObjectId,
            ref: 'Machine',
        },
        // New: Multiple RSOs linked to this hospital
        rsos: [
            {
                type: Schema.Types.ObjectId,
                ref: 'RSO',
                default: [],
            },
        ],
        // New: Multiple Institutes linked to this hospital
        institutes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Institute',
                default: [],
            },
        ],
        enquiries: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Enquiry",
            }
        ],
        qaReports: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "QAReport", // assuming QAReport is a model
            },

        ],
        // customer: { type: Schema.Types.ObjectId, ref: 'User' }, // ✅ added

    },
    { timestamps: true }
);

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;