// import mongoose from "mongoose";

// // Define each row's structure
// const exposureRateRowSchema = new mongoose.Schema({
//     distance: {
//         type: String,
//         required: false,
//     },
//     appliedKv: {
//         type: String,
//         required: false,
//     },
//     appliedMa: {
//         type: String,
//         required: false,
//     },
//     exposure: {
//         type: String,
//         required: false,
//     },
//     remark: {
//         type: String,
//         required: false,
//     },
// });

// // Main schema for the Exposure Rate test
// const exposureRateTableTopSchema = new mongoose.Schema(
//     {
//         testName: {
//             type: String,
//             default: "Exposure Rate at Table Top",
//         },

//         rows: {
//             type: [exposureRateRowSchema],
//             default: [],
//         },

//         tolerance: {
//             type: String,
//             default: "",
//         },

//         note: {
//             type: String,
//             default: "",
//         },

//         reportId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "ServiceReport",
//         },
//         serviceId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Service",
//         },

//         createdAt: {
//             type: Date,
//             default: Date.now,
//         },
//     },
//     { timestamps: true }
// );

// export default mongoose.model(
//     "ExposureRateTableTop",
//     exposureRateTableTopSchema
// );
// models/ExposureRateTableTop.js

import mongoose from "mongoose";

const exposureRateRowSchema = new mongoose.Schema({
    distance: { type: String }, // cm
    appliedKv: { type: String }, // kV
    appliedMa: { type: String }, // mA
    exposure: { type: String }, // cGy/Min
    remark: { type: String }, // "AEC Mode" or "Manual Mode"
});

const exposureRateTableTopSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    },

    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceReport",
    },

    // Main data table
    rows: {
        type: [exposureRateRowSchema],
        default: [],
    },

    // Dynamic tolerance values
    nonAecTolerance: { type: String }, // Exposure rate without AEC mode (cGy/Min)
    aecTolerance: { type: String }, // Exposure rate with AEC mode (cGy/Min)
    minFocusDistance: { type: String }, // Minimum focus to tabletop distance (cm)

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Auto-update updatedAt
exposureRateTableTopSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Indexes for performance
exposureRateTableTopSchema.index({ serviceId: 1 });
exposureRateTableTopSchema.index({ reportId: 1 });

export default mongoose.model("ExposureRateTableTop", exposureRateTableTopSchema);