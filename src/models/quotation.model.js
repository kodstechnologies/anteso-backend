import { Schema } from "mongoose";
import mongoose from 'mongoose'
import { generateReadableId } from "../utils/GenerateReadableId.js";
import { type } from "os";

const quotationSchema = new Schema(
    {
        quotationId: {
            type: String,
            unique: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        enquiry: {
            type: Schema.Types.ObjectId,
            ref: 'Enquiry',
            required: true,
        },
        from: {
            type: Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true,
        },
        subtotal: {
            type: Number,
            required: true,
        },
        gstRate: {
            type: Number,
            default: 18, // Always 18%
        },
        gstAmount: {
            type: Number,
            default: 0,
        },

        discount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            required: true,
        },

        quotationStatus: {
            type: String,
            enum: ['Create', 'Created', 'Accepted', 'Rejected'],
            // default: 'Create',
        },
        rejectionRemark: {
            type: String
        },
        customersPDF: {
            type: String
        },
        termsAndConditions: [
            {
                id: { type: Number, required: true },
                text: { type: String, required: true }
            }
        ]
        ,
        pdfUrl: {
            type: String,
            default: null,
        },
        assignedEmployee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee', // Reference the Employee model
        },
        isUploaded: {
            type: Boolean,
            default: false,
        }

    },
    { timestamps: true }
);

quotationSchema.pre('save', async function (next) {
    if (!this.quotationId) {
        this.quotationId = await generateReadableId('Quotation', 'QUO');
    }
    next();
});

const Quotation = mongoose.model('Quotation', quotationSchema);

export default Quotation;