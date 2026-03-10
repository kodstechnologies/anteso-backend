import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    location: { type: String, required: true, trim: true },
    mRPerHr: { type: String, trim: true },
    mRPerWeek: { type: String, trim: true },
    result: { type: String, trim: true },
    category: { type: String, trim: true },
});

const RadiationProtectionSurveySchema = new mongoose.Schema({
    surveyDate: { type: Date, required: true },
    hasValidCalibration: { type: String, trim: true },
    appliedCurrent: { type: String, trim: true },
    appliedVoltage: { type: String, trim: true },
    exposureTime: { type: String, trim: true },
    workload: { type: String, trim: true },
    locations: [LocationSchema],
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", index: true },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceReport", index: true },
}, { timestamps: true });

export default mongoose.model("RadiationProtectionSurveyDentalHandHeld", RadiationProtectionSurveySchema);
