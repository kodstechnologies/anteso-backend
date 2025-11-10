import mongoose from "mongoose";


export default function updatedByPlugin(schema) {
    // Add updatedBy fields
    schema.add({
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: "updatedByModel",
            required: false,
        },
        updatedByModel: {
            type: String,
            enum: ["Admin", "User"],
            required: false,
        },
    });

    // Auto-populate updatedBy whenever you fetch documents
    schema.pre(/^find/, function (next) {
        this.populate({
            path: "updatedBy",
            select: "name email phone role technicianType",
        });
        next();
    });
}
