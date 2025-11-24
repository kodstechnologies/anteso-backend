import mongoose from "mongoose";
const noteSchema = new mongoose.Schema({
    slNo: { type: String },
    text: { type: String },
}, { _id: false });
const toolDetailsSchema = new mongoose.Schema({
    tool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tool",
    },
    SrNo: {
        type: String,
    },
    nomenclature: {
        type: String,
    },
    make: {
        type: String,
    },
    model: {
        type: String,
    },
    range: {
        type: String,
    },
    calibrationCertificateNo: {
        type: String,
    },
    calibrationValidTill: {
        type: String,
    },
    certificate: {
        type: String,
    },
    // validity: {
    //     type: Date,
    // },
    uncertainity: {
        type: String,
    }
}, { _id: false });

const serviceReportSchema = new mongoose.Schema({
    customerName: {
        type: String
    },
    address: {
        type: String
    },
    srfNumber: {
        type: String
    },
    srfDate: {
        type: Date
    },
    testReportNumber: {
        type: String
    },
    issueDate: {
        type: Date,
    },
    nomenclature: {
        type: String
    },
    make: {
        type: String
    },
    model: {
        type: String
    },
    slNumber: {
        type: String
    },
    condition: {
        type: String
    },
    testingProcedureNumber: {
        type: String
    },
    engineerNameRPId: {
        type: String
    },
    pages: {
        type: String
    },
    testDate: {
        type: Date,
    },
    testDueDate: {
        type: Date,
    },
    location: {
        type: String
    },
    temperature: {
        type: String
    },
    humidity: {
        type: String
    },
    toolsUsed: [toolDetailsSchema],
    notes: {
        type: [noteSchema],
        default: [
            { slNo: "5.1", text: "The Test Report relates only to the above item only." },
            { slNo: "5.2", text: "Publication or reproduction of this Certificate in any form other than by complete set of the whole report & in the language written, is not permitted without the written consent of ABPL." },
            { slNo: "5.3", text: "Corrections/erasing invalidates the Test Report." },
            { slNo: "5.4", text: "Referred standard for Testing: AERB Test Protocol 2016 - AERB/RF-MED/SC-3 (Rev. 2) Quality Assurance Formats." },
            { slNo: "5.5", text: "Any error in this Report should be brought to our knowledge within 30 days from the date of this report." },
            { slNo: "5.6", text: "Results reported are valid at the time of and under the stated conditions of measurements." },
            { slNo: "5.7", text: "Name, Address & Contact detail is provided by Customer." }
        ]
    },
    // accuracyOfOperatingPotentialModel: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "AccuracyOfOperatingPotential",
    // },
    // effectiveFocalSpotMeasurement: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "EffectiveFocalSpotMeasurement",
    // },
    // ExposureRateTableTop: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ExposureRateTableTop'
    // },
    // HighContrastResolution: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'HighContrastResolution'
    // },
    // LowContrastResolution: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'LowContrastResolution'
    // },
    // LinearityOfmAsLoading: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'LinearityOfmAsLoading'
    // },
    // ConsistencyOfRadiationOutput: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'ConsistencyOfRadiationOutput'
    // },
    // RadiationLeakageLevel: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'RadiationLeakageLevel'
    // },
    RadiationProfileWidthForCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RadiationProfileWidthForCTScan'
    },
    MeasurementOfOperatingPotential: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeasurementOfOperatingPotential'
    },
    TimerAccuracy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimerAccuracy'
    },
    MeasurementOfMaLinearity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeasurementOfMaLinearity'
    },
    MeasurementOfCTDI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeasurementOfCTDI'
    },
    // LowContrastResolutionForCTScan: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'LowContrastResolutionForCTScan'
    // },
    // HighContrastResolutionForCTScan: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'HighContrastResolutionForCTScan'
    // },
    TotalFilterationForCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TotalFilterationForCTScan'
    },
    RadiationLeakageLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RadiationLeakageLevel'
    },
    MeasureMaxRadiationLevel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeasureMaxRadiationLevel'
    },
    OutputConsistency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OutputConsistency",
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
    },
    // mainTestTable: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'MainTestTable',
    // },
    exposureRateTableTop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExposureRateTableTop",
    }
})
export default mongoose.model(
    "ServiceReport",
    serviceReportSchema
);