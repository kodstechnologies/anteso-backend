// models/testTables/LeadApron/LeadApronTest.model.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const LeadApronTestSchema = new Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      unique: true,
      index: true,
    },
    serviceReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadApronServiceReport",
      index: true,
    },

    // Report Details
    reportDetails: {
      institutionName: { type: String, trim: true, default: "" },
      institutionCity: { type: String, trim: true, default: "" },
      equipmentType: { type: String, trim: true, default: "Lead Apron" },
      equipmentId: { type: String, trim: true, default: "" },
      personTesting: { type: String, trim: true, default: "" },
      serviceAgency: { type: String, trim: true, default: "" },
      testDate: { type: Date },
      testDuration: { type: String, trim: true, default: "" }, // e.g., "0.15 Hr"
    },

    // Operating Parameters
    operatingParameters: {
      ffd: { type: String, trim: true, default: "" }, // FFD in cm
      kv: { type: String, trim: true, default: "" },
      mas: { type: String, trim: true, default: "" },
    },

    // Dose Measurements
    doseMeasurements: {
      neutral: { type: String, trim: true, default: "" },
      positions: [{
        position: { type: String, trim: true, default: "" },
        value: { type: String, trim: true, default: "" },
      }],
      averageValue: { type: String, trim: true, default: "" },
      percentReduction: { type: String, trim: true, default: "" },
      remark: { type: String, trim: true, default: "" }, // e.g., "Pass, Can use further"
    },

    // Footer
    footer: {
      place: { type: String, trim: true, default: "" },
      date: { type: Date },
      signature: { type: String, trim: true, default: "" },
      serviceEngineerName: { type: String, trim: true, default: "" },
      serviceAgencyName: { type: String, trim: true, default: "" },
      serviceAgencySeal: { type: String, trim: true, default: "" },
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Update the `updatedAt` field on save
LeadApronTestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

LeadApronTestSchema.index({ serviceId: 1 }, { unique: true });

const LeadApronTest = model('LeadApronTest', LeadApronTestSchema);

export default LeadApronTest;

