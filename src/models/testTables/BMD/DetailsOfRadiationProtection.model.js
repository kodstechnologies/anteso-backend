// models/RadiationProtectionInterventionalRadiology.js
import mongoose from 'mongoose';

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

export default
  mongoose.model('RadiationProtectionBMD', RadiationProtectionIRSchema);