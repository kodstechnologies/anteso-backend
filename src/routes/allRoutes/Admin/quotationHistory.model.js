// models/QuotationHistory.js
import mongoose, { Schema } from "mongoose";

const quotationHistorySchema = new Schema(
    {
        quotation: {
            type: Schema.Types.ObjectId,
            ref: "Quotation",
            required: true,
        },
        status: {
            type: String,
            enum: ["Created", "Accepted", "Rejected"],
            required: true,
        },
        pdfUrl: {
            type: String,
            default: null,
        },
        date: {
            type: Date,
            default: Date.now,
        },
        remark: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

const QuotationHistory = mongoose.model("QuotationHistory", quotationHistorySchema);
export default QuotationHistory;