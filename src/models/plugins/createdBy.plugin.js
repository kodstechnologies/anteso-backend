// // src/models/plugins/createdBy.plugin.js
// import mongoose from "mongoose";

// export default function createdByPlugin(schema) {
//     schema.add({
//         createdBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: false,
//             refPath: "createdByModel", // dynamic reference
//         },
//         createdByModel: {
//             type: String,
//             required: false,
//             enum: ["Admin", "User"], // possible creator models
//         },
//     });

//     // Auto-populate creator info (only selected fields)
//     schema.pre(/^find/, function (next) {
//         this.populate({
//             path: "createdBy",
//             select: "name email phone role", // only show minimal fields
//         });
//         next();
//     });
// }


// src/models/plugins/createdBy.plugin.js
import mongoose from "mongoose";

export default function createdByPlugin(schema) {
    schema.add({
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
            refPath: "createdByModel", // dynamic reference to Admin or User
        },
        createdByModel: {
            type: String,
            required: false,
            enum: ["Admin", "User"], // matches your model names
        },
    });

    // ✅ Automatically populate createdBy with relevant fields
    schema.pre(/^find/, function (next) {
        this.populate({
            path: "createdBy",
            select: "name email phone role technicianType", // include technicianType if available
        });
        next();
    });
}
