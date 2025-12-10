// models/AccuracyOfOperatingPotentialAndTime.js

import mongoose from "mongoose";

const { Schema } = mongoose;

const accuracyOfOperatingPotentialAndTimeSchema = new Schema(
    {
        serviceId: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        reportId: {
            type: Schema.Types.ObjectId,
            ref: "ServiceReport",
        },

        // Dynamic test rows
        rows: [
            {
                appliedKvp: { type: String },
                setTime: { type: String },
                // New format: maStations array (supports dynamic number of stations)
                maStations: [
                    {
                        kvp: { type: String },
                        time: { type: String },
                    },
                ],
                // Legacy format: maStation1 and maStation2 (for backward compatibility)
                maStation1: {
                    kvp: { type: String },
                    time: { type: String },
                },
                maStation2: {
                    kvp: { type: String },
                    time: { type: String },
                },
                avgKvp: { type: String },
                avgTime: { type: String },
                remark: { type: String },
            },
        ],

        // kVp Tolerance
        kvpToleranceSign: { type: String },
        kvpToleranceValue: { type: String },

        // Time Tolerance
        timeToleranceSign: { type: String },
        timeToleranceValue: { type: String },

        // Total Filtration
        totalFiltration: {
            atKvp: { type: String },
            measured1: { type: String },
            measured2: { type: String },
        },

        // Total Filtration Tolerance Specification
        filtrationTolerance: {
            value1: { type: String },
            operator1: { type: String },
            kvp1: { type: String },
            value2: { type: String },
            operator2: { type: String },
            kvp2: { type: String },
            value3: { type: String },
            operator3: { type: String },
            kvp3: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

// Safe model registration for ESM + hot reload
const AccuracyOfOperatingPotentialAndTime =

    mongoose.model("AccuracyOfOperatingPotentialAndTimeDentalIntra", accuracyOfOperatingPotentialAndTimeSchema);

export default AccuracyOfOperatingPotentialAndTime;