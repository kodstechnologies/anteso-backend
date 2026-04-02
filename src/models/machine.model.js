// models/machine.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// Hardcoded list of machine types
const MACHINE_TYPES = [
    "Radiography (Fixed)",
    "Radiography (Mobile)",
    "Radiography (Portable)",
    "Radiography and Fluoroscopy",
    "Interventional Radiology",
    "C-Arm",
    "O-Arm",
    "Computed Tomography",
    "Mammography",  
    "Dental Cone Beam CT",
    "Ortho Pantomography (OPG)",
    "Dental (Intra Oral)",
    "Dental (Hand-held)",
    "Bone Densitometer (BMD)",
    "KV Imaging (OBI)",
    "Radiography (Mobile) with HT",
    "Lead Apron/Thyroid Shield/Gonad Shield",
    "Others",
];

const machineSchema = new Schema(
    {
        machineType: {
            type: String,
            enum: MACHINE_TYPES,
            required: true,
        },
        make: {
            type: String,
            required: true,
            trim: true,
        },
        model: {
            type: String,
            required: true,
            trim: true,
        },
        serialNumber: {
            type: String,
            required: true,
            // unique: true,
        },
        equipmentId: {
            type: String,
            required: true,
            // unique: true,
        },
        qaValidity: {
            type: Date,
            required: true,
        },
        licenseValidity: {
            type: Date,
            required: true,
        },
        // status: {
        //     type: String,
        //     enum: ['Working', 'Not Working', 'Under Maintenance'],
        //     required: true,
        // },
        rawDataAttachment: {
            type: String,
            default: null,
        },
        qaReportAttachment: {
            type: String,
            required: false,
        },
        licenseReportAttachment: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ['Active', 'Expired']
        },
        // customer: {
        //     type: Schema.Types.ObjectId,
        //     ref: 'Customer',
        //     required: true,
        // },
        hospital: {   // ✅ machine knows which hospital it belongs to
            type: Schema.Types.ObjectId,
            ref: 'Hospital',
            required: true,
        },
    },
    { timestamps: true }
);

const Machine = mongoose.model('Machine', machineSchema);

export default Machine;