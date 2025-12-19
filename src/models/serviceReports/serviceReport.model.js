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
    lowContrastResolutionForCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LowContrastResolutionForCTScan'
    },
    HighContrastResolutionForCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HighContrastResolutionForCTScan'
    },
    LinearityOfMasLoadingCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LinearityOfMasLoadingCTScan'
    },
    AlignmentOfTableGantryCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AlignmentOfTableGantryCTScan'
    },
    TablePositionCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TablePositionCTScan'
    },
    GantryTiltCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GantryTiltCTScan'
    },
    RadiationProtectionSurveyCTScan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RadiationProtectionSurveyCTScan'
    },
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
    },


    //opg
    AccuracyOfIrradiationTimeOPG: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "AccuracyOfIrradiationTimeOPG"
    },
    AccuracyOfOperatingPotentialOPG: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "AccuracyOfOperatingPotentialOPG"
    },
    OutputConsistencyForOPG: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "OutputConsistencyForOPG"
    },
    LinearityOfMaLoadingOPG: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "LinearityOfMaLoadingOPG"
    },
    RadiationLeakageTestOPG: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "RadiationLeakageTestOPG"
    },
    RadiationProtectionSurveyOPG: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "RadiationProtectionSurveyOPG"
    },

    //dental intra
    AccuracyOfOperatingPotentialAndTimeDentalIntra: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfOperatingPotentialAndTimeDentalIntra"
    },
    LinearityOfTimeDentalIntra: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfTimeDentalIntra"
    },
    ReproducibilityOfRadiationOutputDentalIntra: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReproducibilityOfRadiationOutputDentalIntra"
    },
    TubeHousingLeakageDentalIntra: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageDentalIntra"
    },
    RadiationLeakageTestDentalIntra: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationLeakageTestDentalIntra"
    },

    //Dental Hand-held
    AccuracyOfOperatingPotentialAndTimeDentalHandHeld: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfOperatingPotentialAndTimeDentalHandHeld"
    },
    LinearityOfTimeDentalHandHeld: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfTimeDentalHandHeld"
    },
    ReproducibilityOfRadiationOutputDentalHandHeld: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReproducibilityOfRadiationOutputDentalHandHeld"
    },
    TubeHousingLeakageDentalHandHeld: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageDentalHandHeld"
    },
    RadiationLeakageTestDentalHandHeld: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationLeakageTestDentalHandHeld"
    },

    //C-Arm
    AccuracyOfIrradiationTimeCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfIrradiationTimeCArm"
    },
    ExposureRateTableTopCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExposureRateTableTopCArm"
    },
    HighContrastResolutionCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HighContrastResolutionCArm"
    },
    LowContrastResolutionCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LowContrastResolutionCArm"
    },
    OutputConsistencyForCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OutputConsistencyForCArm"
    },
    TotalFilterationForCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TotalFilterationForCArm"
    },
    TubeHousingLeakageCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageCArm"
    },
    LinearityOfmAsLoadingCArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfmAsLoadingCArm"
    },
    //O-Arm
    ExposureRateTableTopOArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExposureRateTableTopOArm"
    },
    HighContrastResolutionOArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HighContrastResolutionOArm"
    },
    LowContrastResolutionOArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LowContrastResolutionOArm"
    },
    OutputConsistencyForOArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OutputConsistencyForOArm"
    },
    TotalFilterationForOArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TotalFilterationForOArm"
    },
    TubeHousingLeakageOArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageOArm"
    },
    LinearityOfmAsLoadingOArm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfmAsLoadingOArm"
    },

    //radiography fixed
    AccuracyOfIrradiationTimeRadiographyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "AccuracyOfIrradiationTimeRadiographyFixed"
    },
    accuracyOfOperatingPotentialRadigraphyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "accuracyOfOperatingPotentialRadigraphyFixed"
    },
    TotalFilterationRadiographyFixed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TotalFilterationForRadiographyFixed"
    },
    CentralBeamAlignmentRadiographyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "CentralBeamAlignmentRadiographyFixed"
    },
    CongruenceOfRadiationRadioGraphyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "CongruenceOfRadiationRadioGraphyFixed"
    },
    EffectiveFocalSpotRadiographyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "EffectiveFocalSpotRadiographyFixed"
    },
    LinearityOfmAsLoadingRadiographyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "LinearityOfmAsLoadingRadiographyFixed"
    },
    ConsistencyOfRadiationOutputFixedRadiography: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "ConsistencyOfRadiationOutputFixedRadiography"
    },
    RadiationLeakageLevelRadiographyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "RadiationLeakageLevelRadiographyFixed"
    },
    RadiationProtectionSurveyRadiographyFixed: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "RadiationProtectionSurveyRadiographyFixed"
    },

    //radiography mobile with HT
    AccuracyOfIrradiationTimeRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfIrradiationTimeRadiographyMobileHT"
    },
    accuracyOfOperatingPotentialRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accuracyOfOperatingPotentialRadiographyMobileHT"
    },
    CentralBeamAlignmentRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CentralBeamAlignmentRadiographyMobileHT"
    },
    CongruenceOfRadiationRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CongruenceOfRadiationRadiographyMobileHT"
    },
    EffectiveFocalSpotRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EffectiveFocalSpotRadiographyMobileHT"
    },
    LinearityOfmAsLoadingRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfmAsLoadingRadiographyMobileHT"
    },
    ConsistencyOfRadiationOutputRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConsistencyOfRadiationOutputRadiographyMobileHT"
    },
    RadiationLeakageLevelRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationLeakageLevelRadiographyMobileHT"
    },
    RadiationProtectionSurveyRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationProtectionSurveyRadiographyMobileHT"
    },
    TotalFilterationRadiographyMobileHT: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TotalFilterationRadiographyMobileHT"
    },

    //radiography portable
    accuracyOfOperatingPotentialRadigraphyPortable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accuracyOfOperatingPotentialRadigraphyPortable"
    },
    AccuracyOfIrradiationTimeRadiographyPortable: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "AccuracyOfIrradiationTimeRadiographyPortable"
    },
    CentralBeamAlignmentRadiographyPortable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CentralBeamAlignmentRadiographyPortable"
    },
    CongruenceOfRadiationRadioGraphyPortable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CongruenceOfRadiationRadioGraphyPortable"
    },
    ConsistencyOfRadiationOutputRadiographyPortable: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "ConsistencyOfRadiationOutputRadiographyPortable"
    },
    EffectiveFocalSpotRadiographyPortable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EffectiveFocalSpotRadiographyPortable"
    },
    LinearityOfmAsLoadingRadiographyPortable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfmAsLoadingRadiographyPortable"
    },
    RadiationLeakageLevelRadiographyPortable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationLeakageLevelRadiographyPortable"
    },

    //radiography mobile
    AccuracyOfIrradiationTimeRadiographyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfIrradiationTimeRadiographyMobile"
    },
    accuracyOfOperatingPotentialRadigraphyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accuracyOfOperatingPotentialRadigraphyMobile"
    },
    CentralBeamAlignmentRadiographyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CentralBeamAlignmentRadiographyMobile"
    },
    CongruenceOfRadiationRadioGraphyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CongruenceOfRadiationRadioGraphyMobile"
    },
    EffectiveFocalSpotRadiographyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EffectiveFocalSpotRadiographyMobile"
    },
    LinearityOfmAsLoadingRadiographyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfmAsLoadingRadiographyMobile"
    },
    ConsistencyOfRadiationOutputRadiographyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConsistencyOfRadiationOutputRadiographyMobile"
    },
    RadiationLeakageLevelRadiographyMobile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationLeakageLevelRadiographyMobile"
    },

    //OBI
    AlignmentTestOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AlignmentTestOBI"
    },
    accuracyOfOperatingPotentialOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "accuracyOfOperatingPotentialOBI"
    },
    CentralBeamAlignmentOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CentralBeamAlignmentOBI"
    },
    CongruenceOfRadiationOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CongruenceOfRadiationOBI"
    },
    EffectiveFocalSpotOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EffectiveFocalSpotOBI"
    },
    HighContrastSensitivityOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HighContrastSensitivityOBI"
    },
    LinearityOfMasLoadingStationsOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfMasLoadingStationsOBI"
    },
    LinearityOfTimeOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfTimeOBI"
    },
    LowContrastSensitivityOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LowContrastSensitivityOBI"
    },
    OutputConsistencyOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OutputConsistencyOBI"
    },
    RadiationProtectionSurveyOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationProtectionSurveyOBI"
    },
    TimerTestOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TimerTestOBI"
    },
    TubeHousingLeakageOBI: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageOBI"
    },

    //Mammography
    AccuracyOfOperatingPotentialMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfOperatingPotentialMammography"
    },
    TotalFilterationAndAlluminiumMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TotalFilterationAndAlluminiumMammography"
    },
    ImagingPhantomMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ImagingPhantomMammography"
    },
    ReproducibilityOfRadiationOutputMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReproducibilityOfOutputMmmography"
    },
    RadiationLeakageLevelMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationLeakageLevelMammography"
    },
    DetailsOfRadiationProtectionMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DetailsOfRadiationProtectionMammography"
    },
    EquipmentSettingMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EquipmentSettingForMammography"
    },
    MaximumRadiationLevelMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MaximumRadiationLevelMammography"
    },
    LinearityOfMasLoadingMammography: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfMasLLoadingMammography"
    },

    //Interventional Radiology
    AccuracyOfIrradiationTimeInventionalRadiology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfIrradiationTimeInventionalRadiology"
    },
    CentralBeamAlignmentInventionalRadiology:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"CentralBeamAlignmentInventionalRadiology"
    },
    ConsistencyOfRadiationOutputInventionalRadiology:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"ConsistencyOfRadiationOutputInventionalRadiology"
    },

    EffectiveFocalSpotInventionalRadiology:{    
        type: mongoose.Schema.Types.ObjectId,
        ref:"EffectiveFocalSpotInventionalRadiology"    
    },
    ExposureRateTableTopInventionalRadiology:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"ExposureRateTableTopInventionalRadiology"
    },
    MaxRadiationLevelInventionalRadiology:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"MaxRadiationLevelInventionalRadiology"
    },
    RadiationProtectionSurveyInventionalRadiology:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"RadiationProtectionSurveyInventionalRadiology"
    },
    TubeHousingLeakageInventionalRadiology:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"TubeHousingLeakageInventionalRadiology"
    },
    TotalFilterationForInventionalRadiology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TotalFilterationForInventionalRadiology"
    },
    ExposureRateTableTopInventionalRadiology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExposureRateTableTopInventionalRadiology"
    },
    HighContrastResolutionInventionalRadiology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HighContrastResolutionInventionalRadiology"
    },
    LowContrastResolutionInventionalRadiology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LowContrastResolutionInventionalRadiology"
    },
    TubeHousingLeakageInventionalRadiology: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageInventionalRadiology"
    },
    // BMD
    AccuracyOfOperatingPotentialAndTimeBMD: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AccuracyOfOperatingPotentialAndTimeBMD"
    },
    ReproducibilityOfRadiationOutputBMD: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ConsistencyOfRadiationOutputBMD"
    },
    LinearityOfMaLoadingBMD: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LinearityOfMaLoadingBMD"
    },
    TubeHousingLeakageBMD: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TubeHousingLeakageBMD"
    },
    RadiationProtectionSurveyBMD: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RadiationProtectionBMD"
    },
})
export default mongoose.model(
    "ServiceReport",
    serviceReportSchema
);