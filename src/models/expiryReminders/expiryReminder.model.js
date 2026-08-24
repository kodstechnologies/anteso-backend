import mongoose, { Schema } from "mongoose";

const expiryReminderSchema = new Schema(
    {
        type: {
            type: String,
            enum: ["qa", "license"],
            required: true,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: "Service",
            required: true,
        },
        qaTest: {
            type: Schema.Types.ObjectId,
            ref: "QATest",
        },
        elora: {
            type: Schema.Types.ObjectId,
            ref: "Elora",
        },
        serviceReport: {
            type: Schema.Types.ObjectId,
            refPath: "serviceReportModel",
        },
        serviceReportModel: {
            type: String,
            enum: ["ServiceReport", "LeadApronServiceReport"],
        },
        srfNumber: { type: String },
        hospitalName: { type: String },
        contactNumber: { type: String },
        machineType: { type: String },
        workType: { type: String },
        /** QA: ServiceReport.testDueDate. License: workTypeDetails.licenseValidTill */
        expiryDate: {
            type: Date,
            required: true,
        },
        /** One month before expiryDate */
        reminderDate: {
            type: Date,
        },
        /** QATest.reportPdf */
        reportPdf: { type: String },
        /** Elora.report */
        report: { type: String },
        status: {
            type: String,
            enum: ["pending", "acknowledged"],
            default: "pending",
        },
    },
    { timestamps: true }
);

expiryReminderSchema.index({ type: 1, expiryDate: 1 });
expiryReminderSchema.index(
    { type: 1, service: 1, qaTest: 1, elora: 1 },
    { unique: true }
);

expiryReminderSchema.pre("validate", function (next) {
    if (this.expiryDate && !this.reminderDate) {
        const reminder = new Date(this.expiryDate);
        reminder.setMonth(reminder.getMonth() - 1);
        this.reminderDate = reminder;
    }
    next();
});

const ExpiryReminder = mongoose.model("ExpiryReminder", expiryReminderSchema);
export default ExpiryReminder;
