// models/RadiationProtectionInterventionalRadiology.js
import mongoose from 'mongoose';

// Location measurement schema for Maximum Radiation Level Survey
const LocationMeasurementSchema = new mongoose.Schema({
  location: { type: String, trim: true, required: true },
  mRPerHr: { type: String, trim: true, default: '' },
  mRPerWeek: { type: String, trim: true, default: '' },
  result: { type: String, trim: true, default: '' },
  category: { type: String, enum: ['worker', 'public'], default: 'worker' },
}, { _id: false });

const RadiationProtectionIRSchema = new mongoose.Schema(
  {
    // Survey Details
    surveyDate: { type: String, trim: true },                    // ISO date string
    surveyMeterModel: { type: String, trim: true },              // Model & S/N
    calibrationCertificateValid: { type: String, trim: true },   // Yes/No/N/A

    // Personal Protective Equipment
    leadApronsAvailable: { type: String, trim: true },           // Yes/No + quantity
    thyroidShieldsAvailable: { type: String, trim: true },
    leadGlassesAvailable: { type: String, trim: true },

    // Structural Shielding & Accessories
    ceilingSuspendedShield: { type: String, trim: true },        // Available/Not Available
    tableLeadCurtain: { type: String, trim: true },

    // Dose Monitoring
    doseAreaProductMeter: { type: String, trim: true },          // Yes/No
    patientDoseMonitoring: { type: String, trim: true },         // Real-time system

    // Maximum Radiation Level Survey - Equipment Settings
    appliedCurrent: { type: String, trim: true, default: '' },      // mA
    appliedVoltage: { type: String, trim: true, default: '' },      // kV
    exposureTime: { type: String, trim: true, default: '' },        // seconds
    workload: { type: String, trim: true, default: '' },            // mA min/week

    // Maximum Radiation Level Survey - Location Measurements
    locations: [LocationMeasurementSchema],

    // Foreign Keys
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceReport',
    },

    // Soft delete
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
RadiationProtectionIRSchema.index({ serviceId: 1 });
RadiationProtectionIRSchema.index({ reportId: 1 });
RadiationProtectionIRSchema.index({ serviceId: 1, reportId: 1 });

export default mongoose.model('RadiationProtectionBMD', RadiationProtectionIRSchema);