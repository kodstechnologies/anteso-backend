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
    category: {
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
    },
    CongruenceOfRadiationForRadioFluro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CongruenceOfRadiationForRadioFluro",
    },
    CentralBeamAlignmentForRadioFluoro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CentralBeamAlignmentForRadioFluoro"
    },
    accuracyOfOperatingPotentialFixedRadioFluoro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accuracyOfOperatingPotentialFixedRadioFluoro"
    },
    OutputConsistencyForFixedRadioFlouro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OutputConsistencyForFixedRadioFlouro"
    },
    LowContrastResolutionFixedRadioFlouro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LowContrastResolutionFixedRadioFlouro"
    },
    HighContrastResolutionFixedRadioFluoro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HighContrastResolutionFixedRadioFluoro"
    },
    ExposureRateTableTopFixedRadioFlouro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExposureRateTableTopFixedRadioFlouro"
    },
    LinearityOfmAsLoadingFixedRadioFluoro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfmAsLoadingFixedRadioFluoro",

    },
    RadiationProtectionSurvey: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationProtectionSurvey"
    },
    TubeHousingLeakageFixedRadioFlouro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageFixedRadioFlouro"
    },
    AccuracyOfIrradiationTimeFixedRadioFluoro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfIrradiationTimeFixedRadioFluoro"
    },

    CongruenceOfRadiationRadiographyFixedMobie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CongruenceOfRadiationRadiographyFixedMobie"
    },
    CentralBeamAlignmentRadiographyFixedMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CentralBeamAlignmentRadiographyFixedMobile"
    },
    EffectiveFocalSpotForRadiographyFixedAndMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EffectiveFocalSpotForRadiographyFixedAndMobile"
    },
    accuracyOfOperatingPotentialRadigraphyFixedMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accuracyOfOperatingPotentialRadigraphyFixedMobile"
    },


    //cbct
    AccuracyOfIrradiationTimeCBCT: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "AccuracyOfIrradiationTimeCBCT"
    },
    AccuracyOfOperatingPotentialCBCT: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "AccuracyOfOperatingPotentialCBCT"
    },
    OutputConsistencyForCBCT: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "OutputConsistencyForCBCT"
    },
    LinearityOfMaLoadingCBCT: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "LinearityOfMaLoadingCBCT"
    },
    RadiationLeakageTestCBCT: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "RadiationLeakageTestCBCT"
    },
    RadiationProtectionSurveyCBCT: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "RadiationProtectionSurveyCBCT"
    }

})
export default mongoose.model(
    "ServiceReport",
    serviceReportSchema
);