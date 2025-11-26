// models/EquipmentSettingForInterventionalRadiology.js
import mongoose from 'mongoose';

const EquipmentSettingSchema = new mongoose.Schema(
  {
    // Technique Parameters
    appliedCurrent: { type: String, trim: true },        // mA
    appliedVoltage: { type: String, trim: true },        // kV
    exposureTime: { type: String, trim: true },          // ms (pulse width)
    focalSpotSize: { type: String, trim: true },         // e.g. 0.3/0.6/1.0 mm
    filtration: { type: String, trim: true },            // mm Al equivalent
    collimation: { type: String, trim: true },           // Automatic/Manual
    frameRate: { type: String, trim: true },             // fps
    pulseWidth: { type: String, trim: true },            // ms in pulsed mode

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
EquipmentSettingSchema.index({ serviceId: 1 });
EquipmentSettingSchema.index({ reportId: 1 });
EquipmentSettingSchema.index({ serviceId: 1, reportId: 1 });

export default mongoose.model('EquipmentSettingForMammography', EquipmentSettingSchema);