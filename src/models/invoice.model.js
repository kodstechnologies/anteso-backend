// import mongoose, { Schema } from "mongoose";

import mongoose, { Schema } from "mongoose";

// const serviceSchema = new Schema({
//     machineType: { type: String },
//     description: { type: String },
//     quantity: { type: Number },
//     rate: { type: Number },
//     hsnno: { type: String },
// });

// const dealerHospitalSchema = new Schema({
//     partyCode: { type: String },
//     hospitalName: { type: String },
//     location: { type: String },
//     dealerState: { type: String },
//     modelNo: { type: String },
//     amount: { type: Number },
// });

// const invoiceSchema = new Schema(
//     {
//         type: {
//             type: String,
//             enum: ["Customer", "Dealer/Manufacturer"],
//         },
//         invoiceId: { type: String, },
//         srfNumber: { type: String, },
//         buyerName: { type: String },
//         address: { type: String },
//         state: { type: String },
//         gstin: { type: String },

//         // If Customer
//         services: [serviceSchema],

//         // If Dealer/Manufacturer
//         dealerHospitals: [dealerHospitalSchema],

//         // Common Fields
//         totalAmount: { type: Number },
//         remarks: { type: String },
//         sgst: { type: Number, default: 0 },
//         cgst: { type: Number, default: 0 },
//         igst: { type: Number, default: 0 },
//         discount: { type: Number, default: 0 },
//         subtotal: { type: Number },
//         grandtotal: { type: Number },

//         // Reference to Enquiry
//         enquiry: {
//             type: Schema.Types.ObjectId,
//             ref: "Enquiry",
//         },
//         payment: {
//             type: Schema.Types.ObjectId,
//             ref: "Payment",
//         },
//         // Inside invoiceSchema
//         order: {
//             type: Schema.Types.ObjectId,
//             ref: "Order", // reference to Order model
//         },
//         invoicePdf: {
//             type: String
//         },
//         invoiceuploaded:{
//             type:Boolean,
//             default:false
//         }
//     },
//     { timestamps: true }
// );

// const Invoice = mongoose.model("Invoice", invoiceSchema);

// export default Invoice;

// import mongoose, { Schema } from "mongoose";

// const serviceSchema = new Schema({
//     machineType: { type: String },
//     description: { type: String },
//     quantity: { type: Number },
//     rate: { type: Number },
//     hsnno: { type: String },
// });

// const dealerHospitalSchema = new Schema({
//     partyCode: { type: String },
//     hospitalName: { type: String },
//     location: { type: String },
//     dealerState: { type: String },
//     modelNo: { type: String },
//     amount: { type: Number },
// });

// const invoiceSchema = new Schema(
//     {
//         type: {
//             type: String,
//             enum: ["Customer", "Dealer/Manufacturer"],
//         },
//         invoiceId: { type: String, },
//         srfNumber: { type: String, },
//         buyerName: { type: String },
//         address: { type: String },
//         state: { type: String },
//         gstin: { type: String },

//         // If Customer
//         services: [serviceSchema],

//         // If Dealer/Manufacturer
//         dealerHospitals: [dealerHospitalSchema],

//         // Common Fields
//         totalAmount: { type: Number },
//         remarks: { type: String },
//         sgst: { type: Number, default: 0 },
//         cgst: { type: Number, default: 0 },
//         igst: { type: Number, default: 0 },
//         discount: { type: Number, default: 0 },
//         subtotal: { type: Number },
//         grandtotal: { type: Number },
//         paymentType: {
//             type: String,
//             enum: ['advance', 'balance', 'complete'],
//             default: null
//         },

//         // Reference to Enquiry
//         enquiry: {
//             type: Schema.Types.ObjectId,
//             ref: "Enquiry",
//         },
//         payment: {
//             type: Schema.Types.ObjectId,
//             ref: "Payment",
//         },
//         // Inside invoiceSchema
//         order: {
//             type: Schema.Types.ObjectId,
//             ref: "Order", // reference to Order model
//         },
//         invoicePdf: {
//             type: String
//         },
//         invoiceuploaded: {
//             type: Boolean,
//             default: false
//         }
//     },
//     { timestamps: true }
// );

// const Invoice = mongoose.model("Invoice", invoiceSchema);

// export default Invoice;

// const serviceSchema = new Schema({
//     machineType: { type: String, trim: true },
//     description: { type: String, trim: true },
//     quantity: { type: Number, min: [1, "Quantity must be at least 1"], default: 1 },
//     rate: { type: Number, min: [0, "Rate cannot be negative"], default: 0 },
//     hsnno: { type: String, trim: true },
// });

// const additionalServiceSchema = new Schema({
//     name: { type: String, trim: true },
//     description: { type: String, trim: true },
//     totalAmount: { type: Number, min: [0, "Total amount cannot be negative"], default: 0 },
// });

// const dealerHospitalSchema = new Schema({
//     partyCode: { type: String, trim: true },
//     hospitalName: { type: String, trim: true },
//     location: { type: String, trim: true },
//     dealerState: { type: String, trim: true },
//     modelNo: { type: String, trim: true },
//     amount: { type: Number, min: [0, "Amount cannot be negative"], default: 0 },
// });

// const invoiceSchema = new Schema(
//     {
//         type: {
//             type: String,
//             enum: ["Customer", "Dealer/Manufacturer"],
//             required: [true, "Invoice type is required"],
//         },
//         invoiceId: { type: String, required: [true, "Invoice ID is required"], unique: true },
//         srfNumber: { type: String, required: [true, "SRF Number is required"], trim: true },
//         buyerName: { type: String, required: [true, "Buyer name is required"], trim: true },
//         address: { type: String, trim: true },
//         state: { type: String, trim: true },
//         gstin: { type: String, trim: true },

//         // Services for both Customer and Dealer/Manufacturer
//         services: [serviceSchema],

//         // Additional services for both types
//         additionalServices: [additionalServiceSchema],

//         // Dealer/Manufacturer specific
//         dealerHospitals: [dealerHospitalSchema],

//         // Common Fields
//         totalAmount: { type: Number, min: [0, "Total amount cannot be negative"], default: 0 },
//         remarks: { type: String, trim: true },
//         sgst: { type: Number, min: [0, "SGST cannot be negative"], default: 0 },
//         cgst: { type: Number, min: [0, "CGST cannot be negative"], default: 0 },
//         igst: { type: Number, min: [0, "IGST cannot be negative"], default: 0 },
//         discount: { type: Number, min: [0, "Discount cannot be negative"], default: 0 },
//         subtotal: { type: Number, min: [0, "Subtotal cannot be negative"], default: 0 },
//         grandtotal: { type: Number, min: [0, "Grand total cannot be negative"], default: 0 },
//         paymentType: {
//             type: String,
//             enum: ['advance', 'balance', 'complete', null],
//             default: null,
//         },

//         // References
//         enquiry: {
//             type: Schema.Types.ObjectId,
//             ref: "Enquiry",
//         },
//         payment: {
//             type: Schema.Types.ObjectId,
//             ref: "Payment",
//         },
//         order: {
//             type: Schema.Types.ObjectId,
//             ref: "Order",
//             required: [true, "Order reference is required"],
//         },
//         invoicePdf: {
//             type: String,
//             trim: true,
//         },
//         invoiceuploaded: {
//             type: Boolean,
//             default: false,
//         },
//     },
//     { timestamps: true }
// );

// // Custom validation for Dealer/Manufacturer invoices
// invoiceSchema.pre('validate', function (next) {
//     if (this.type === "Dealer/Manufacturer") {
//         if (
//             (!this.services || this.services.length === 0) &&
//             (!this.dealerHospitals || this.dealerHospitals.length === 0)
//         ) {
//             this.invalidate(
//                 "services",
//                 "At least one service or dealer hospital entry is required for Dealer/Manufacturer invoice",
//                 this.services
//             );
//         }
//     }
//     next();
// });

// const Invoice = mongoose.model("Invoice", invoiceSchema);

// export default Invoice;
const serviceSchema = new Schema({
    machineType: { type: String, trim: true },
    description: { type: String, trim: true },
    quantity: { type: Number, min: [1, "Quantity must be at least 1"], default: 1 },
    rate: { type: Number, min: [0, "Rate cannot be negative"], default: 0 },
    hsnno: { type: String, trim: true },
});

const additionalServiceSchema = new Schema({
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    totalAmount: { type: Number, min: [0, "Total amount cannot be negative"], default: 0 },
});

const dealerHospitalSchema = new Schema({
    partyCode: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    city: { type: String, trim: true }, // Changed from location to city
    dealerState: { type: String, trim: true },
    modelNo: { type: String, trim: true },
    amount: { type: Number, min: [0, "Amount cannot be negative"], default: 0 },
    services: [serviceSchema], // Nested services for each dealer hospital
    additionalServices: [additionalServiceSchema], // Nested additional services
});

const invoiceSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["Customer", "Dealer/Manufacturer"],
            required: [true, "Invoice type is required"],
        },
        invoiceId: { type: String, required: [true, "Invoice ID is required"], unique: true },
        srfNumber: { type: String, required: [true, "SRF Number is required"], trim: true },
        buyerName: { type: String, required: [true, "Buyer name is required"], trim: true },
        address: { type: String, trim: true },
        state: { type: String, trim: true },
        gstin: { type: String, trim: true },
        services: [serviceSchema], // Top-level services for Customer invoices
        additionalServices: [additionalServiceSchema], // Top-level additional services for Customer invoices
        dealerHospitals: [dealerHospitalSchema], // Updated schema for Dealer/Manufacturer invoices
        totalAmount: { type: Number, min: [0, "Total amount cannot be negative"], default: 0 },
        remarks: { type: String, trim: true },
        sgst: { type: Number, min: [0, "SGST cannot be negative"], default: 0 },
        cgst: { type: Number, min: [0, "CGST cannot be negative"], default: 0 },
        igst: { type: Number, min: [0, "IGST cannot be negative"], default: 0 },
        discount: { type: Number, min: [0, "Discount cannot be negative"], default: 0 },
        subtotal: { type: Number, min: [0, "Subtotal cannot be negative"], default: 0 },
        grandtotal: { type: Number, min: [0, "Grand total cannot be negative"], default: 0 },
        paymentType: {
            type: String,
            enum: ['advance', 'balance', 'complete', null],
            default: null,
        },
        enquiry: {
            type: Schema.Types.ObjectId,
            ref: "Enquiry",
        },
        payment: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            required: [true, "Order reference is required"],
        },
        invoicePdf: {
            type: String,
            trim: true,
        },
        invoiceuploaded: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Custom validation for Dealer/Manufacturer invoices
invoiceSchema.pre('validate', function (next) {
    if (this.type === "Dealer/Manufacturer") {
        if (
            (!this.services || this.services.length === 0) &&
            (!this.dealerHospitals || this.dealerHospitals.length === 0)
        ) {
            this.invalidate(
                "services",
                "At least one service or dealer hospital entry is required for Dealer/Manufacturer invoice",
                this.services
            );
        }
        // Validate that each dealer hospital has at least one service or additional service
        if (this.dealerHospitals && this.dealerHospitals.length > 0) {
            this.dealerHospitals.forEach((dh, index) => {
                if (
                    (!dh.services || dh.services.length === 0) &&
                    (!dh.additionalServices || dh.additionalServices.length === 0)
                ) {
                    this.invalidate(
                        `dealerHospitals[${index}].services`,
                        "At least one service or additional service is required for each dealer hospital",
                        dh.services
                    );
                }
            });
        }
    }
    next();
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;