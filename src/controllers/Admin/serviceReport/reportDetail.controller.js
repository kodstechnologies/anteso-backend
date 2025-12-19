import orderModel from "../../../models/order.model.js";
import QATest from "../../../models/QATest.model.js";
import serviceReportModel from "../../../models/serviceReports/serviceReport.model.js";
import LeadApronServiceReport from "../../../models/serviceReports/leadApronServiceReport.model.js";
import Services from "../../../models/Services.js";
import MeasurementOfMaLinearity from "../../../models/testTables/CTScan/measurementOfMaLinearity.model.js";
import MeasurementOfOperatingPotential from "../../../models/testTables/CTScan/MeasurementOfOperatingPotential.model.js";
import outputConsistencyForCtScanModel from "../../../models/testTables/CTScan/outputConsistencyForCtScan.model.js";
import RadiationProfileWidth from "../../../models/testTables/CTScan/RadiationProfileWidth.model.ForCTScan.js";
import TimerAccuracy from "../../../models/testTables/CTScan/TimerAccuracy.model.js";
import MeasurementOfCTDI from "../../../models/testTables/CTScan/measurementOfCTDI.model.js";
import Tools from "../../../models/tools.model.js";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import TotalFilterationForCTScan from "../../../models/testTables/CTScan/TotalFilterationForCTScan.js";
import RadiationLeakageLeveFromXRayTube from "../../../models/testTables/CTScan/radiationLeakageLevelFromXRayTubeHouse.model.js";
import MeasureMaxRadiationLevel from "../../../models/testTables/CTScan/MeasureMaxRadiationLevel.model.js";
import OutputConsistency from "../../../models/testTables/CTScan/outputConsistency.model.js";
import LowContrastResolutionForCTScan from "../../../models/testTables/CTScan/LowContrastResolutionForCTScan.model.js";
import HighContrastResolutionForCTScan from "../../../models/testTables/CTScan/HighContrasrResolutionForCTScan.model.js";
import LinearityOfMasLoadingCTScan from "../../../models/testTables/CTScan/LinearityOfMasLoading.model.js";
import RadiationProtectionSurveyCTScan from "../../../models/testTables/CTScan/RadiationProtectionSurvey.model.js";
// import outputConsistencyForCtScanModel from "../../../models/testTables/CTScan/outputConsistencyForCtScan.model.js";
import "../../../models/testTables/DentalIntra/AccuracyOfOperatingPotentialAndTime.model.js";
import "../../../models/testTables/DentalIntra/LinearityOfTime.model.js";
import "../../../models/testTables/DentalIntra/ReproducibilityOfRadiationOutput.model.js";
import "../../../models/testTables/DentalIntra/TubeHousingLeakage.model.js";
import "../../../models/testTables/DentalIntra/RadiationLeakagelevel.model.js";
// Import DentalHandHeld models to ensure they're registered with Mongoose
import "../../../models/testTables/DentalHandHeld/AccuracyOfOperatingPotentialAndTime.model.js";
import "../../../models/testTables/DentalHandHeld/LinearityOfTime.model.js";
import "../../../models/testTables/DentalHandHeld/ReproducibilityOfRadiationOutput.model.js";
import "../../../models/testTables/DentalHandHeld/TubeHousingLeakage.model.js";
// Import RadiographyFixed models to ensure they're registered with Mongoose
import "../../../models/testTables/RadiographyFixed/AccuracyOfIrradiationTime.model.js";
import "../../../models/testTables/RadiographyFixed/AccuracyOfOperatingPotential.model.js";
import "../../../models/testTables/RadiographyFixed/CentralBeamAlignment.model.js";
import "../../../models/testTables/RadiographyFixed/congruence.model.js";
import "../../../models/testTables/RadiographyFixed/EffectiveFocalSpot.model.js";
import "../../../models/testTables/RadiographyFixed/LinearityOfMasLoadingStations.model.js";
import "../../../models/testTables/RadiographyFixed/OutputConsistency.model.js";
import "../../../models/testTables/RadiographyFixed/RadiationLeakageLevel.model.js";
import "../../../models/testTables/RadiographyFixed/RadiationProtectionSurvey.model.js";
import "../../../models/testTables/RadiographyFixed/TotalFilteration.model.js";
// Import RadiographyMobileHT models to ensure they're registered with Mongoose
import "../../../models/testTables/RadiographyMobileHT/AccuracyOfIrradiationTime.model.js";
import "../../../models/testTables/RadiographyMobileHT/AccuracyOfOperatingPotential.model.js";
import "../../../models/testTables/RadiographyMobileHT/CentralBeamAlignment.model.js";
import "../../../models/testTables/RadiographyMobileHT/congruence.model.js";
import "../../../models/testTables/RadiographyMobileHT/EffectiveFocalSpot.model.js";
import "../../../models/testTables/RadiographyMobileHT/LinearityOfMasLoadingStations.model.js";
import "../../../models/testTables/RadiographyMobileHT/OutputConsistency.model.js";
import "../../../models/testTables/RadiographyMobileHT/RadiationLeakageLevel.model.js";
import "../../../models/testTables/RadiographyMobileHT/RadiationProtectionSurvey.model.js";
import "../../../models/testTables/RadiographyMobileHT/TotalFilteration.model.js";

// Import RadiographyPortable models to ensure they're registered with Mongoose
import "../../../models/testTables/RadiographyPortable/AccuracyOfIrradiationTime.model.js";
import "../../../models/testTables/RadiographyPortable/AccuracyOfOperatingPotential.model.js";
import "../../../models/testTables/RadiographyPortable/CentralBeamAlignment.model.js";
import "../../../models/testTables/RadiographyPortable/CongruenceOfRadiation.model.js";
import "../../../models/testTables/RadiographyPortable/EffectiveFocalSpot.model.js";
import "../../../models/testTables/RadiographyPortable/LinearityOfMasLoadingStations.model.js";
import "../../../models/testTables/RadiographyPortable/ConsisitencyOfRadiationOutput.model.js";
import "../../../models/testTables/RadiographyPortable/RadiationLeakageLevel.model.js";
// Import RadiographyMobile models to ensure they're registered with Mongoose
import "../../../models/testTables/RadiographyMobile/AccuracyOfIrradiationTime.model.js";
import "../../../models/testTables/RadiographyMobile/AccuracyOfOperatingPotential.model.js";
import "../../../models/testTables/RadiographyMobile/CentralBeamAlignment.model.js";
import "../../../models/testTables/RadiographyMobile/CongruenceOfRadiation.model.js";
import "../../../models/testTables/RadiographyMobile/EffectiveFocalSpot.model.js";
import "../../../models/testTables/RadiographyMobile/LinearityOfMasLoadingStations.model.js";
import "../../../models/testTables/RadiographyMobile/ConsisitencyOfRadiationOutput.model.js";
import "../../../models/testTables/RadiographyMobile/RadiationLeakageLevel.model.js";
// Import OBI models to ensure they're registered with Mongoose
import "../../../models/testTables/OBI/AlignmentTest.model.js";
import "../../../models/testTables/OBI/AccuracyOfOperatingPotential.model.js";
import "../../../models/testTables/OBI/CentralBeamAlignment.model.js";
import "../../../models/testTables/OBI/CongruenceOfRadiation.model.js";
import "../../../models/testTables/OBI/EffectiveFocalSpot.model.js";
import "../../../models/testTables/OBI/HighContrastSensitivity.model.js";
import "../../../models/testTables/OBI/LinearityOfMasLoadingStations.model.js";
import "../../../models/testTables/OBI/LinearityOfTime.model.js";
import "../../../models/testTables/OBI/LowContrastSensitivity.model.js";
import "../../../models/testTables/OBI/OutputConsistency.model.js";
import "../../../models/testTables/OBI/RadiationProtection.model.js";
import "../../../models/testTables/OBI/TimerTest.model.js";
import "../../../models/testTables/OBI/TubeHousingLeakage.model.js";
// Import CArm models to ensure they're registered with Mongoose
import "../../../models/testTables/CArm/ExposureRateTableTop.model.js";
import "../../../models/testTables/CArm/HighContrastResolution.model.js";
import "../../../models/testTables/CArm/LowContrastResolution.model.js";
import "../../../models/testTables/CArm/OutputConsisitency.model.js";
import "../../../models/testTables/CArm/TotalFilteration.model.js";
import "../../../models/testTables/CArm/TubeHousingLeakage.model.js";
import "../../../models/testTables/CArm/LinearityOfMasLoadingStation.model.js";
// Import OArm models to ensure they're registered with Mongoose
import "../../../models/testTables/OArm/ExposureRateTableTop.model.js";
import "../../../models/testTables/OArm/HighContrastResolution.model.js";
import "../../../models/testTables/OArm/LowContrastResolution.model.js";
import "../../../models/testTables/OArm/OutputConsisitency.model.js";
import "../../../models/testTables/OArm/TotalFilteration.model.js";
import "../../../models/testTables/OArm/TubeHousingLeakage.model.js";
import "../../../models/testTables/OArm/LinearityOfMasLoadingStation.model.js";
// Import Mammography models to ensure they're registered with Mongoose
import "../../../models/testTables/Mammography/AccuracyOfOperatingPotential.model.js";
import "../../../models/testTables/Mammography/TotalFiltrationAndAluminium.model.js";
import "../../../models/testTables/Mammography/ImagingPhantom.model.js";
import "../../../models/testTables/Mammography/ReproducibilityOfOutput.model.js";
import "../../../models/testTables/Mammography/RadiationLeakageLevel.model.js";
import "../../../models/testTables/Mammography/DetailsOfRadiationProtectionMammography.model.js";
import "../../../models/testTables/Mammography/EquipmentSetting.model.js";
import "../../../models/testTables/Mammography/MaxRadiationLevel.model.js";
import "../../../models/testTables/Mammography/LinearityOfMasLoading.model.js";
// Import InventionalRadiology models to ensure they're registered with Mongoose
import "../../../models/testTables/InventionalRadiology/CentralBeamAlignment.model.js";
import "../../../models/testTables/InventionalRadiology/EffectiveFocalSpot.model.js";
import "../../../models/testTables/InventionalRadiology/accuracyOfIrradiationTime.model.js";
import "../../../models/testTables/InventionalRadiology/TotalFilterationForInventionalRadiology.model.js";
import "../../../models/testTables/InventionalRadiology/ConsistencyOfRadiationOutput.model.js";
import "../../../models/testTables/InventionalRadiology/LowContrastResolution.model.js";
import "../../../models/testTables/InventionalRadiology/HighContrastResolution.model.js";
import "../../../models/testTables/InventionalRadiology/ExposureRateTableTop.model.js";
import "../../../models/testTables/InventionalRadiology/tubeHousingLeakage.model.js";
import "../../../models/testTables/InventionalRadiology/RadiationProtectionSurvey.model.js";
import mongoose from "mongoose";


export const getCustomerDetails = asyncHandler(async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "serviceId is required in URL",
            });
        }

        // 1️⃣ Find the order that contains this serviceId
        const order = await orderModel
            .findOne({ services: serviceId })
            .select("hospitalName fullAddress srfNumber")
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found for the given serviceId",
            });
        }

        // 2️⃣ Find the service and include details
        const service = await Services.findById(serviceId)
            .select("machineType machineModel serialNumber workTypeDetails")
            .populate({
                path: "workTypeDetails.engineer",
                select: "name email designation technicianType", // adjust fields as per Employee schema
            })
            .lean();

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Extract QATest IDs from workTypeDetails (if any)
        const qaTestIds = service.workTypeDetails
            ?.map((w) => w.QAtest)
            .filter((id) => !!id);

        let qaTestReportNumbers = [];

        if (qaTestIds && qaTestIds.length > 0) {
            const qaTests = await QATest.find({ _id: { $in: qaTestIds } })
                .select("qaTestReportNumber reportULRNumber createdAt")
                .lean();

            qaTestReportNumbers = qaTests.map((q) => ({
                qaTestId: q._id,
                qaTestReportNumber: q.qaTestReportNumber || "N/A",
                reportULRNumber: q.reportULRNumber || "N/A",
                createdAt: q.createdAt || null,
            }));
        }

        // Find the engineer assigned for Quality Assurance Test (if present)
        const qaEngineer = service.workTypeDetails?.find(
            (w) => w.workType === "Quality Assurance Test" && w.engineer
        )?.engineer;

        // 3️⃣ Construct final response
        return res.status(200).json({
            success: true,
            data: {
                hospitalName: order.hospitalName,
                hospitalAddress: order.fullAddress,
                srfNumber: order.srfNumber,
                machineType: service.machineType,
                machineModel: service.machineModel || "N/A",
                serialNumber: service.serialNumber || "N/A",
                engineerAssigned: qaEngineer
                    ? {
                        name: qaEngineer.name || "N/A",
                        email: qaEngineer.email || "N/A",
                        designation: qaEngineer.designation || "N/A",
                        technicianType: qaEngineer.technicianType || "N/A",
                    }
                    : null,
                qaTests: qaTestReportNumbers,
            },
        });
    } catch (error) {
        console.error("getCustomerDetails Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer details",
            error: error.message,
        });
    }
});

const getTools = asyncHandler(async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "serviceId is required in URL",
            });
        }

        // 1️⃣ Find the service and get engineer assigned (if any)
        const service = await Services.findById(serviceId)
            .select("workTypeDetails machineType machineModel serialNumber")
            .populate({
                path: "workTypeDetails.engineer",
                select: "name email designation technicianType",
            })
            .lean();

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // 2️⃣ Find the engineer assigned for Quality Assurance (or any engineer)
        const qaEngineer = service.workTypeDetails?.find(
            (w) =>
                w.workType === "Quality Assurance Test" &&
                w.engineer &&
                w.engineer._id
        )?.engineer;

        if (!qaEngineer) {
            return res.status(404).json({
                success: false,
                message: "No engineer assigned for this service",
            });
        }

        // 3️⃣ Find tools assigned to this engineer
        const tools = await Tools.find({ technician: qaEngineer._id })
            .select(
                "toolId SrNo nomenclature manufacturer model range calibrationCertificateNo calibrationValidTill certificate toolStatus submitDate"
            )
            .lean();

        // 4️⃣ Build and return structured response
        return res.status(200).json({
            success: true,
            data: {
                engineer: {
                    id: qaEngineer._id,
                    name: qaEngineer.name,
                    email: qaEngineer.email,
                    designation: qaEngineer.designation,
                    technicianType: qaEngineer.technicianType,
                },
                machineDetails: {
                    machineType: service.machineType,
                    machineModel: service.machineModel || "N/A",
                    serialNumber: service.serialNumber || "N/A",
                },
                toolsAssigned: tools.length > 0 ? tools : [],
            },
        });
    } catch (error) {
        console.error("getTools Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tools",
            error: error.message,
        });
    }
});

// controllers/serviceReportController.js
// const saveReportHeader = async (req, res) => {
//     const { serviceId } = req.params;
//     const {
//         customerName,
//         address,
//         srfNumber,
//         srfDate,
//         testReportNumber,
//         issueDate,
//         nomenclature,
//         make,
//         model,
//         slNumber,
//         condition,
//         testingProcedureNumber,
//         engineerNameRPId,
//         pages,
//         testDate,
//         testDueDate,
//         location,
//         temperature,
//         humidity,
//         toolsUsed,
//         notes,
//     } = req.body;

//     try {
//         // 1. Find existing ServiceReport by serviceId
//         const report = await serviceReportModel.findOne({ serviceId });
//         console.log("🚀 ~ saveReportHeader ~ report:", report)
//         if (!report) {
//             return res.status(404).json({
//                 message: 'ServiceReport not found. Please generate the test report first.'
//             });
//         }

//         // 2. Format toolsUsed
//         const formattedTools = toolsUsed.map((tool) => ({
//             tool: tool.toolId ? tool.toolId : null,
//             SrNo: tool.SrNo,
//             nomenclature: tool.nomenclature,
//             make: tool.make,
//             model: tool.model,
//             range: tool.range,
//             calibrationCertificateNo: tool.calibrationCertificateNo,
//             calibrationValidTill: tool.calibrationValidTill,
//             certificate: tool.certificate,
//             uncertainity: tool.uncertainity,
//         }));

//         // 3. Format notes
//         const formattedNotes = notes.map((n) => ({
//             slNo: n.slNo,
//             text: n.text,
//         }));

//         // 4. Update the existing report
//         Object.assign(report, {
//             customerName,
//             address,
//             srfNumber,
//             srfDate: srfDate ? new Date(srfDate) : null,
//             testReportNumber,
//             issueDate: issueDate ? new Date(issueDate) : null,
//             nomenclature,
//             make,
//             model,
//             slNumber,
//             condition,
//             testingProcedureNumber,
//             engineerNameRPId,
//             pages,
//             testDate: testDate ? new Date(testDate) : null,
//             testDueDate: testDueDate ? new Date(testDueDate) : null,
//             location,
//             temperature,
//             humidity,
//             toolsUsed: formattedTools,
//             notes: formattedNotes,
//         });

//         await report.save();

//         return res.status(200).json({
//             message: 'Report header updated successfully',
//             report
//         });

//     } catch (error) {
//         console.error('Save report header error:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };

// // GET /api/service-report/:serviceId/header
// // controllers/reportDetailController.js  (or wherever it is)
// const getReportHeader = async (req, res) => {
//     const { serviceId } = req.params;

//     try {
//         const report = await serviceReportModel
//             .findOne({ serviceId })
//             .populate('toolsUsed.tool', 'nomenclature make model')
//             .lean();

//         // ALWAYS return exists: true if the document exists
//         // Even if header is not filled yet – we just return empty strings
//         if (!report) {
//             return res.status(200).json({ exists: false });
//         }

//         const format = (date) => (date ? new Date(date).toISOString().split('T')[0] : '');

//         res.status(200).json({
//             exists: true,                        // ← ALWAYS true if document exists
//             data: {
//                 customerName: report.customerName || '',
//                 address: report.address || '',
//                 srfNumber: report.srfNumber || '',
//                 srfDate: format(report.srfDate),
//                 testReportNumber: report.testReportNumber || '',
//                 issueDate: format(report.issueDate),
//                 nomenclature: report.nomenclature || '',
//                 make: report.make || '',
//                 model: report.model || '',
//                 slNumber: report.slNumber || '',
//                 condition: report.condition || 'OK',
//                 testingProcedureNumber: report.testingProcedureNumber || '',
//                 engineerNameRPId: report.engineerNameRPId || '',
//                 pages: report.pages || '',
//                 testDate: format(report.testDate),
//                 testDueDate: format(report.testDueDate),
//                 location: report.location || '',
//                 temperature: report.temperature || '',
//                 humidity: report.humidity || '',
//                 toolsUsed: (report.toolsUsed || []).map((t, i) => ({
//                     slNumber: String(i + 1),
//                     toolId: t.tool?._id || null,
//                     nomenclature: t.nomenclature || '',
//                     make: t.make || '',
//                     model: t.model || '',
//                     SrNo: t.SrNo || '',
//                     range: t.range || '',
//                     calibrationCertificateNo: t.calibrationCertificateNo || '',
//                     calibrationValidTill: t.calibrationValidTill || '',
//                     certificate: t.certificate || '',
//                     uncertainity: t.uncertainity || '',
//                 })),
//                 notes: report.notes || [], // will use defaults on frontend if empty
//             },
//         });
//     } catch (error) {
//         console.error('Get report header error:', error);
//         res.status(500).json({ exists: false, message: 'Server error' });
//     }
// };




// const saveReportHeader = async (req, res) => {
//     const { serviceId } = req.params;
//     const {
//         customerName,
//         address,
//         srfNumber,
//         srfDate,
//         testReportNumber,
//         issueDate,
//         nomenclature,
//         make,
//         model,
//         slNumber,
//         condition,
//         testingProcedureNumber,
//         engineerNameRPId,
//         pages,
//         testDate,
//         testDueDate,
//         location,
//         temperature,
//         humidity,
//         toolsUsed,
//         notes,
//     } = req.body;

//     try {
//         let report = await serviceReportModel.findOne({ serviceId });
//         if (!report) {
//             return res.status(404).json({
//                 message: 'ServiceReport not found. Please generate the test report first.'
//             });
//         }

//         // FORMAT TOOLS & NOTES
//         const formattedTools = toolsUsed.map((tool) => ({
//             tool: tool.toolId || null,
//             SrNo: tool.SrNo,
//             nomenclature: tool.nomenclature,
//             make: tool.make,
//             model: tool.model,
//             range: tool.range,
//             calibrationCertificateNo: tool.calibrationCertificateNo,
//             calibrationValidTill: tool.calibrationValidTill,
//             certificate: tool.certificate,
//             uncertainity: tool.uncertainity,
//         }));

//         const formattedNotes = notes.map((n) => ({
//             slNo: n.slNo,
//             text: n.text,
//         }));

//         // FIND LATEST TEST RECORDS FOR THIS serviceId
//         // FIND LATEST TEST RECORDS FOR THIS serviceId
//         const [
//             radiationProfile,
//             operatingPotential,
//             maLinearity,
//             timerAccuracy,
//             ctdi,
//             totalFiltration,
//             leakage,
//             outputConsistency,
//         ] = await Promise.all([
//             RadiationProfileWidth.findOne({ serviceId }).sort({ createdAt: -1 }),
//             MeasurementOfOperatingPotential.findOne({ serviceId }).sort({ createdAt: -1 }),
//             MeasurementOfMaLinearity.findOne({ serviceId }).sort({ createdAt: -1 }),
//             TimerAccuracy.findOne({ serviceId }).sort({ createdAt: -1 }),
//             MeasurementOfCTDI.findOne({ serviceId }).sort({ createdAt: -1 }),
//             TotalFilterationForCTScan.findOne({ serviceId }).sort({ createdAt: -1 }),
//             RadiationLeakageLeveFromXRayTube.findOne({ serviceId }).sort({ createdAt: -1 }), // ← FIXED
//             outputConsistencyForCtScanModel.findOne({ serviceId }).sort({ createdAt: -1 }), // ← ADDED
//         ]);

//         // UPDATE REPORT WITH HEADER + TEST IDs
//         Object.assign(report, {
//             customerName,
//             address,
//             srfNumber,
//             srfDate: srfDate ? new Date(srfDate) : null,
//             testReportNumber,
//             issueDate: issueDate ? new Date(issueDate) : null,
//             nomenclature,
//             make,
//             model,
//             slNumber,
//             condition,
//             testingProcedureNumber,
//             engineerNameRPId,
//             pages,
//             testDate: testDate ? new Date(testDate) : null,
//             testDueDate: testDueDate ? new Date(testDueDate) : null,
//             location,
//             temperature,
//             humidity,
//             toolsUsed: formattedTools,
//             notes: formattedNotes,


//             operatingPotentialId: operatingPotential?._id?.toString() || null,
//             radiationProfileWidthId: radiationProfile?._id?.toString() || null,
//             maLinearityId: maLinearity?._id?.toString() || null,
//             timerAccuracyId: timerAccuracy?._id?.toString() || null,
//             ctdiId: ctdi?._id?.toString() || null,
//             totalFiltrationId: totalFiltration?._id?.toString() || null,
//             radiationLeakageId: leakage?._id?.toString() || null,
//             outputConsistencyId: outputConsistency?._id?.toString() || null,
//         });

//         await report.save();

//         return res.status(200).json({
//             message: 'Report header saved successfully!',
//             report
//         });

//     } catch (error) {
//         console.error('Save report header error:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// };



const saveReportHeader = async (req, res) => {
    const { serviceId } = req.params;
    const {
        customerName,
        address,
        srfNumber,
        srfDate,
        testReportNumber,
        issueDate,
        nomenclature,
        make,
        category,
        model,
        slNumber,
        condition,
        testingProcedureNumber,
        engineerNameRPId,
        pages,
        testDate,
        testDueDate,
        location,
        temperature,
        humidity,
        toolsUsed,
        notes,
    } = req.body;

    try {
        let report = await serviceReportModel.findOne({ serviceId });
        if (!report) {
            return res.status(404).json({
                message: "ServiceReport not found. Please generate the test report first.",
            });
        }

        // FORMAT TOOLS
        // const formattedTools = toolsUsed?.map((tool) => ({
        //     tool: tool.toolId || null,
        //     SrNo: tool.SrNo,
        //     nomenclature: tool.nomenclature,
        //     make: tool.make,
        //     model: tool.model,
        //     range: tool.range,
        //     calibrationCertificateNo: tool.calibrationCertificateNo,
        //     calibrationValidTill: tool.calibrationValidTill,
        //     certificate: tool.certificate,
        //     uncertainity: tool.uncertainity,
        // })) || [];

        const formattedTools = toolsUsed?.map((tool) => {
            // Validate toolId is a valid ObjectId, otherwise set to null
            let toolId = null;
            if (tool.toolId) {
                // Check if it's a valid ObjectId (24 character hex string)
                if (mongoose.Types.ObjectId.isValid(tool.toolId) && typeof tool.toolId === 'string' && tool.toolId.length === 24) {
                    toolId = tool.toolId;
                } else {
                    // If it's not a valid ObjectId (e.g., it's a URL), set to null
                    console.warn(`Invalid toolId format: ${tool.toolId}. Expected ObjectId, got ${typeof tool.toolId}`);
                    toolId = null;
                }
            }

            return {
                tool: toolId,
                SrNo: tool.SrNo,
                nomenclature: tool.nomenclature,
                make: tool.make,
                model: tool.model,
                range: tool.range,
                calibrationCertificateNo: tool.calibrationCertificateNo,
                calibrationValidTill: tool.calibrationValidTill,
                certificate: tool.certificate,
                uncertainity: tool.uncertainity,
            };
        }) || [];


        // FORMAT NOTES
        const formattedNotes = notes?.map((n) => ({
            slNo: n.slNo,
            text: n.text,
        })) || [];

        // UPDATE ONLY HEADER FIELDS (NO TEST ID LOOKUP)
        Object.assign(report, {
            customerName,
            address,
            srfNumber,
            srfDate: srfDate ? new Date(srfDate) : null,
            testReportNumber,
            issueDate: issueDate ? new Date(issueDate) : null,
            nomenclature,
            make,
            category,
            model,
            slNumber,
            condition,
            testingProcedureNumber,
            engineerNameRPId,
            pages,
            testDate: testDate ? new Date(testDate) : null,
            testDueDate: testDueDate ? new Date(testDueDate) : null,
            location,
            temperature,
            humidity,
            toolsUsed: formattedTools,
            notes: formattedNotes,
        });

        await report.save();

        return res.status(200).json({
            message: "Report header saved successfully!",
            report,
        });

    } catch (error) {
        console.error("Save report header error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// const getReportHeader = async (req, res) => {
//     const { serviceId } = req.params;

//     try {
//         const report = await serviceReportModel
//             .findOne({ serviceId })
//             .populate('toolsUsed.tool', 'nomenclature make model')
//             .lean();

//         if (!report) {
//             return res.status(200).json({ exists: false });
//         }

//         const format = (date) => (date ? new Date(date).toISOString().split('T')[0] : '');

//         res.status(200).json({
//             exists: true,
//             data: {
//                 customerName: report.customerName || '',
//                 address: report.address || '',
//                 srfNumber: report.srfNumber || '',
//                 srfDate: format(report.srfDate),
//                 testReportNumber: report.testReportNumber || '',
//                 issueDate: format(report.issueDate),
//                 nomenclature: report.nomenclature || '',
//                 make: report.make || '',
//                 model: report.model || '',
//                 category:report.category||'',
//                 slNumber: report.slNumber || '',
//                 condition: report.condition || '',
//                 testingProcedureNumber: report.testingProcedureNumber || '',
//                 engineerNameRPId: report.engineerNameRPId || '',
//                 testDate: format(report.testDate),
//                 testDueDate: format(report.testDueDate),
//                 location: report.location || '',
//                 temperature: report.temperature || '',
//                 humidity: report.humidity || '',
//                 toolsUsed: (report.toolsUsed || []).map((t, i) => ({
//                     slNumber: String(i + 1),
//                     toolId: t.tool?._id || null,
//                     nomenclature: t.nomenclature || '',
//                     make: t.make || '',
//                     model: t.model || '',
//                     SrNo: t.SrNo || '',
//                     range: t.range || '',
//                     calibrationCertificateNo: t.calibrationCertificateNo || '',
//                     calibrationValidTill: t.calibrationValidTill || '',
//                     certificate: t.certificate || '',
//                     uncertainity: t.uncertainity || '',
//                 })),
//                 notes: report.notes || [],

//                 // THIS IS THE FINAL FIX — SUPPORT BOTH OLD & NEW FIELD NAMES
//                 // radiationProfileWidthId: report.radiationProfileWidthId || report.RadiationProfileWidthForCTScan || null,
//                 // operatingPotentialId: report.operatingPotentialId || report.MeasurementOfOperatingPotential || null,
//                 // maLinearityId: report.maLinearityId || report.MeasurementOfMaLinearity || null,
//                 // timerAccuracyId: report.timerAccuracyId || report.TimerAccuracy || null,
//                 // ctdiId: report.ctdiId || report.MeasurementOfCTDI || null,
//                 // totalFiltrationId: report.totalFiltrationId || report.TotalFilterationForCTScan || null,
//                 // radiationLeakageId: report.radiationLeakageId || report.RadiationLeakageLevel || null,
//                 // outputConsistencyId:
//                 //     report.outputConsistencyId ||
//                 //     report.ConsistencyOfRadiationOutput ||
//                 //     report.OutputConsistency ||
//                 //     null
//             },
//         });
//     } catch (error) {
//         console.error('Get report header error:', error);
//         res.status(500).json({ exists: false, message: 'Server error' });
//     }
// };

const getReportHeader = async (req, res) => {
    const { serviceId } = req.params;

    try {
        const fixedRadioFluoroFields = [
            "accuracyOfOperatingPotentialFixedRadioFluoro",
            "OutputConsistencyForFixedRadioFlouro",
            "LowContrastResolutionFixedRadioFlouro",
            "HighContrastResolutionFixedRadioFluoro",
            "ExposureRateTableTopFixedRadioFlouro",
            "LinearityOfmAsLoadingFixedRadioFluoro",
            "TubeHousingLeakageFixedRadioFlouro",
            "AccuracyOfIrradiationTimeFixedRadioFluoro",
            "CongruenceOfRadiationForRadioFluro",
            "CentralBeamAlignmentForRadioFluoro",
            "RadiationProtectionSurvey",
        ];

        let query = serviceReportModel
            .findOne({ serviceId })
            .populate("toolsUsed.tool", "nomenclature make model");

        fixedRadioFluoroFields.forEach((field) => {
            query = query.populate(field);
        });

        const report = await query.lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ FIXED RADIO FLUORO RESULTS
                accuracyOfOperatingPotentialFixedRadioFluoro:
                    report.accuracyOfOperatingPotentialFixedRadioFluoro,

                OutputConsistencyForFixedRadioFlouro:
                    report.OutputConsistencyForFixedRadioFlouro,

                LowContrastResolutionFixedRadioFlouro:
                    report.LowContrastResolutionFixedRadioFlouro,

                HighContrastResolutionFixedRadioFluoro:
                    report.HighContrastResolutionFixedRadioFluoro,

                ExposureRateTableTopFixedRadioFlouro:
                    report.ExposureRateTableTopFixedRadioFlouro,

                LinearityOfmAsLoadingFixedRadioFluoro:
                    report.LinearityOfmAsLoadingFixedRadioFluoro,

                TubeHousingLeakageFixedRadioFlouro:
                    report.TubeHousingLeakageFixedRadioFlouro,

                AccuracyOfIrradiationTimeFixedRadioFluoro:
                    report.AccuracyOfIrradiationTimeFixedRadioFluoro,
                CongruenceOfRadiationForRadioFluro: report.CongruenceOfRadiationForRadioFluro,
                CentralBeamAlignmentForRadioFluoro: report.CentralBeamAlignmentForRadioFluoro,
                RadiationProtectionSurvey: report.RadiationProtectionSurvey,

            },
        });
    } catch (error) {
        console.error("Get report header error:", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};





// Get Report Header for Dental Cone Beam CT
// const getReportHeaderCBCT = async (req, res) => {
//     const { serviceId } = req.params;

//     try {
//         const cbctFields = [
//             "AccuracyOfIrradiationTimeCBCT",
//             "AccuracyOfOperatingPotentialCBCT",
//             "OutputConsistencyForCBCT",
//             "LinearityOfMaLoadingCBCT",
//             "RadiationLeakageTestCBCT",
//             "RadiationProtectionSurveyCBCT",
//         ];

//         let query = serviceReportModel
//             .findOne({ serviceId })
//             .populate("toolsUsed.tool", "nomenclature make model");

//         cbctFields.forEach((field) => {
//             query = query.populate(field);
//         });

//         const report = await query.lean();

//         if (!report) {
//             return res.status(200).json({ exists: false });
//         }

//         const format = (date) =>
//             date ? new Date(date).toISOString().split("T")[0] : "";

//         res.status(200).json({
//             exists: true,
//             data: {
//                 customerName: report.customerName,
//                 address: report.address,
//                 srfNumber: report.srfNumber,
//                 srfDate: format(report.srfDate),
//                 testReportNumber: report.testReportNumber,
//                 issueDate: format(report.issueDate),
//                 nomenclature: report.nomenclature,
//                 make: report.make,
//                 model: report.model,
//                 category: report.category,
//                 slNumber: report.slNumber,
//                 condition: report.condition,
//                 testingProcedureNumber: report.testingProcedureNumber,
//                 engineerNameRPId: report.engineerNameRPId,
//                 testDate: format(report.testDate),
//                 testDueDate: format(report.testDueDate),
//                 location: report.location,
//                 temperature: report.temperature,
//                 humidity: report.humidity,

//                 toolsUsed: (report.toolsUsed || []).map((t, i) => ({
//                     slNumber: i + 1,
//                     toolId: t.tool?._id,
//                     nomenclature: t.nomenclature,
//                     make: t.make,
//                     model: t.model,
//                     SrNo: t.SrNo,
//                     range: t.range,
//                     calibrationCertificateNo: t.calibrationCertificateNo,
//                     calibrationValidTill: t.calibrationValidTill,
//                     certificate: t.certificate,
//                     uncertainity: t.uncertainity,
//                 })),

//                 // ⭐ DENTAL CONE BEAM CT RESULTS
//                 AccuracyOfIrradiationTimeCBCT: report.AccuracyOfIrradiationTimeCBCT,
//                 AccuracyOfOperatingPotentialCBCT: report.AccuracyOfOperatingPotentialCBCT,
//                 OutputConsistencyForCBCT: report.OutputConsistencyForCBCT,
//                 LinearityOfMaLoadingCBCT: report.LinearityOfMaLoadingCBCT,
//                 RadiationLeakageTestCBCT: report.RadiationLeakageTestCBCT,
//                 RadiationProtectionSurveyCBCT: report.RadiationProtectionSurveyCBCT,

//             },
//         });
//     } catch (error) {
//         console.error("Get report header error (CBCT):", error);
//         res.status(500).json({ exists: false, message: "Server error" });
//     }
// };

export const getReportHeaderCBCT = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // All CBCT fields to populate
        const cbctPopulations = [
            { path: "AccuracyOfIrradiationTimeCBCT" },
            { path: "AccuracyOfOperatingPotentialCBCT" },
            { path: "OutputConsistencyForCBCT" },
            { path: "LinearityOfMaLoadingCBCT" },
            { path: "RadiationLeakageTestCBCT" },
            { path: "RadiationProtectionSurveyCBCT" },
        ];

        // Build query
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate(cbctPopulations)
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ DENTAL CBCT TEST RESULTS (POPULATED)
                AccuracyOfIrradiationTimeCBCT: report.AccuracyOfIrradiationTimeCBCT,
                AccuracyOfOperatingPotentialCBCT: report.AccuracyOfOperatingPotentialCBCT,
                OutputConsistencyForCBCT: report.OutputConsistencyForCBCT,
                LinearityOfMaLoadingCBCT: report.LinearityOfMaLoadingCBCT,
                RadiationLeakageTestCBCT: report.RadiationLeakageTestCBCT,
                RadiationProtectionSurveyCBCT: report.RadiationProtectionSurveyCBCT,
            },
        });
    } catch (error) {
        console.error("Get report header error (CBCT):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};



// Get Report Header for OPG
export const getReportHeaderOPG = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // All OPG fields
        const opgFields = [
            "AccuracyOfIrradiationTimeOPG",
            "AccuracyOfOperatingPotentialOPG",
            "OutputConsistencyForOPG",
            "LinearityOfMaLoadingOPG",
            "RadiationLeakageTestOPG",
            "RadiationProtectionSurveyOPG"
        ];

        let query = serviceReportModel
            .findOne({ serviceId })
            .populate("toolsUsed.tool", "nomenclature make model");

        // Populate all OPG fields
        opgFields.forEach(field => {
            query = query.populate(field);
        });

        const report = await query.lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ OPG TEST RESULTS (POPULATED)
                AccuracyOfIrradiationTimeOPG: report.AccuracyOfIrradiationTimeOPG,
                AccuracyOfOperatingPotentialOPG: report.AccuracyOfOperatingPotentialOPG,
                OutputConsistencyForOPG: report.OutputConsistencyForOPG,
                LinearityOfMaLoadingOPG: report.LinearityOfMaLoadingOPG,
                RadiationLeakageTestOPG: report.RadiationLeakageTestOPG,
                RadiationProtectionSurveyOPG: report.RadiationProtectionSurveyOPG,
            },
        });
    } catch (error) {
        console.error("Get report header error (OPG):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};

// Get Report Header for Dental Intra
export const getReportHeaderDentalIntra = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // All Dental Intra fields
        const dentalIntraFields = [
            "AccuracyOfOperatingPotentialAndTimeDentalIntra",
            "LinearityOfTimeDentalIntra",
            "ReproducibilityOfRadiationOutputDentalIntra",
            "TubeHousingLeakageDentalIntra",
            "RadiationLeakageTestDentalIntra",
            "TubeHousingLeakageDentalIntra"
        ];

        let query = serviceReportModel
            .findOne({ serviceId })
            .populate("toolsUsed.tool", "nomenclature make model");

        // Populate all Dental Intra fields
        dentalIntraFields.forEach(field => {
            query = query.populate(field);
        });

        const report = await query.lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ DENTAL INTRA TEST RESULTS (POPULATED)
                AccuracyOfOperatingPotentialAndTimeDentalIntra:
                    report.AccuracyOfOperatingPotentialAndTimeDentalIntra || null,

                LinearityOfTimeDentalIntra:
                    report.LinearityOfTimeDentalIntra || null,

                ReproducibilityOfRadiationOutputDentalIntra:
                    report.ReproducibilityOfRadiationOutputDentalIntra || null,

                TubeHousingLeakageDentalIntra:
                    report.TubeHousingLeakageDentalIntra || null,

                RadiationLeakageTestDentalIntra:
                    report.RadiationLeakageTestDentalIntra || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Dental Intra):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export const getReportHeaderDentalHandHeld = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Build query - populate each field individually (same pattern as CBCT and DentalIntra)
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate("AccuracyOfOperatingPotentialAndTimeDentalHandHeld")
            .populate("LinearityOfTimeDentalHandHeld")
            .populate("ReproducibilityOfRadiationOutputDentalHandHeld")
            .populate("TubeHousingLeakageDentalHandHeld")
            .populate("RadiationLeakageTestDentalHandHeld")
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ DENTAL HAND-HELD TEST RESULTS (POPULATED)
                AccuracyOfOperatingPotentialAndTimeDentalHandHeld: report.AccuracyOfOperatingPotentialAndTimeDentalHandHeld || null,
                LinearityOfTimeDentalHandHeld: report.LinearityOfTimeDentalHandHeld || null,
                ReproducibilityOfRadiationOutputDentalHandHeld: report.ReproducibilityOfRadiationOutputDentalHandHeld || null,
                TubeHousingLeakageDentalHandHeld: report.TubeHousingLeakageDentalHandHeld || null,
                RadiationLeakageTestDentalHandHeld: report.RadiationLeakageTestDentalHandHeld || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Dental Hand-held):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export const getReportHeaderRadiographyFixed = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Build query - populate each field individually
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model calibrationValidTill" })
            .populate("AccuracyOfIrradiationTimeRadiographyFixed")
            .populate("accuracyOfOperatingPotentialRadigraphyFixed")
            .populate("TotalFilterationRadiographyFixed")
            .populate("CentralBeamAlignmentRadiographyFixed")
            .populate("CongruenceOfRadiationRadioGraphyFixed")
            .populate("EffectiveFocalSpotRadiographyFixed")
            .populate("LinearityOfmAsLoadingRadiographyFixed")
            .populate("ConsistencyOfRadiationOutputFixedRadiography")
            .populate("RadiationLeakageLevelRadiographyFixed")
            .populate("RadiationProtectionSurveyRadiographyFixed")
            .lean();
        // console.log("🚀 ~ getReportHeaderRadiographyFixed ~ report:", report)

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ RADIOGRAPHY FIXED TEST RESULTS (POPULATED)
                AccuracyOfIrradiationTimeRadiographyFixed: report.AccuracyOfIrradiationTimeRadiographyFixed || null,
                accuracyOfOperatingPotentialRadigraphyFixed: report.accuracyOfOperatingPotentialRadigraphyFixed || null,
                TotalFilterationRadiographyFixed: report.TotalFilterationRadiographyFixed || null,
                CentralBeamAlignmentRadiographyFixed: report.CentralBeamAlignmentRadiographyFixed || null,
                CongruenceOfRadiationRadioGraphyFixed: report.CongruenceOfRadiationRadioGraphyFixed || null,
                EffectiveFocalSpotRadiographyFixed: report.EffectiveFocalSpotRadiographyFixed || null,
                LinearityOfmAsLoadingRadiographyFixed: report.LinearityOfmAsLoadingRadiographyFixed || null,
                ConsistencyOfRadiationOutputFixedRadiography: report.ConsistencyOfRadiationOutputFixedRadiography || null,
                RadiationLeakageLevelRadiographyFixed: report.RadiationLeakageLevelRadiographyFixed || null,
                RadiationProtectionSurveyRadiographyFixed: report.RadiationProtectionSurveyRadiographyFixed || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Radiography Fixed):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export const getReportHeaderRadiographyMobileHT = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Build query - populate each field individually
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate("AccuracyOfIrradiationTimeRadiographyMobileHT")
            .populate("accuracyOfOperatingPotentialRadiographyMobileHT")
            .populate("CentralBeamAlignmentRadiographyMobileHT")
            .populate("CongruenceOfRadiationRadiographyMobileHT")
            .populate("EffectiveFocalSpotRadiographyMobileHT")
            .populate("LinearityOfmAsLoadingRadiographyMobileHT")
            .populate("ConsistencyOfRadiationOutputRadiographyMobileHT")
            .populate("RadiationLeakageLevelRadiographyMobileHT")
            .populate("RadiationProtectionSurveyRadiographyMobileHT")
            .populate("TotalFilterationRadiographyMobileHT")
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ RADIOGRAPHY MOBILE WITH HT TEST RESULTS (POPULATED)
                AccuracyOfIrradiationTimeRadiographyMobileHT: report.AccuracyOfIrradiationTimeRadiographyMobileHT || null,
                accuracyOfOperatingPotentialRadiographyMobileHT: report.accuracyOfOperatingPotentialRadiographyMobileHT || null,
                CentralBeamAlignmentRadiographyMobileHT: report.CentralBeamAlignmentRadiographyMobileHT || null,
                CongruenceOfRadiationRadiographyMobileHT: report.CongruenceOfRadiationRadiographyMobileHT || null,
                EffectiveFocalSpotRadiographyMobileHT: report.EffectiveFocalSpotRadiographyMobileHT || null,
                LinearityOfmAsLoadingRadiographyMobileHT: report.LinearityOfmAsLoadingRadiographyMobileHT || null,
                ConsistencyOfRadiationOutputRadiographyMobileHT: report.ConsistencyOfRadiationOutputRadiographyMobileHT || null,
                RadiationLeakageLevelRadiographyMobileHT: report.RadiationLeakageLevelRadiographyMobileHT || null,
                RadiationProtectionSurveyRadiographyMobileHT: report.RadiationProtectionSurveyRadiographyMobileHT || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Radiography Mobile with HT):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};



export const getReportHeaderRadiographyPortable = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Build query - populate each field individually
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate("AccuracyOfIrradiationTimeRadiographyPortable")
            .populate("accuracyOfOperatingPotentialRadigraphyPortable")
            .populate("CentralBeamAlignmentRadiographyPortable")
            .populate("CongruenceOfRadiationRadioGraphyPortable")
            .populate("EffectiveFocalSpotRadiographyPortable")
            .populate("LinearityOfmAsLoadingRadiographyPortable")
            .populate("ConsistencyOfRadiationOutputRadiographyPortable")
            .populate("RadiationLeakageLevelRadiographyPortable")
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ RADIOGRAPHY PORTABLE TEST RESULTS (POPULATED)
                AccuracyOfIrradiationTimeRadiographyPortable: report.AccuracyOfIrradiationTimeRadiographyPortable || null,
                accuracyOfOperatingPotentialRadigraphyPortable: report.accuracyOfOperatingPotentialRadigraphyPortable || null,
                CentralBeamAlignmentRadiographyPortable: report.CentralBeamAlignmentRadiographyPortable || null,
                CongruenceOfRadiationRadioGraphyPortable: report.CongruenceOfRadiationRadioGraphyPortable || null,
                EffectiveFocalSpotRadiographyPortable: report.EffectiveFocalSpotRadiographyPortable || null,
                LinearityOfmAsLoadingRadiographyPortable: report.LinearityOfmAsLoadingRadiographyPortable || null,
                ConsistencyOfRadiationOutputRadiographyPortable: report.ConsistencyOfRadiationOutputRadiographyPortable || null,
                RadiationLeakageLevelRadiographyPortable: report.RadiationLeakageLevelRadiographyPortable || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Radiography Portable):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};



export const getReportHeaderRadiographyMobile = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Build query - populate each field individually
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate("AccuracyOfIrradiationTimeRadiographyMobile")
            .populate("accuracyOfOperatingPotentialRadigraphyMobile")
            .populate("CentralBeamAlignmentRadiographyMobile")
            .populate("CongruenceOfRadiationRadioGraphyMobile")
            .populate("EffectiveFocalSpotRadiographyMobile")
            .populate("LinearityOfmAsLoadingRadiographyMobile")
            .populate("ConsistencyOfRadiationOutputRadiographyMobile")
            .populate("RadiationLeakageLevelRadiographyMobile")
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ RADIOGRAPHY MOBILE TEST RESULTS (POPULATED)
                AccuracyOfIrradiationTimeRadiographyMobile: report.AccuracyOfIrradiationTimeRadiographyMobile || null,
                accuracyOfOperatingPotentialRadigraphyMobile: report.accuracyOfOperatingPotentialRadigraphyMobile || null,
                CentralBeamAlignmentRadiographyMobile: report.CentralBeamAlignmentRadiographyMobile || null,
                CongruenceOfRadiationRadioGraphyMobile: report.CongruenceOfRadiationRadioGraphyMobile || null,
                EffectiveFocalSpotRadiographyMobile: report.EffectiveFocalSpotRadiographyMobile || null,
                LinearityOfmAsLoadingRadiographyMobile: report.LinearityOfmAsLoadingRadiographyMobile || null,
                ConsistencyOfRadiationOutputRadiographyMobile: report.ConsistencyOfRadiationOutputRadiographyMobile || null,
                RadiationLeakageLevelRadiographyMobile: report.RadiationLeakageLevelRadiographyMobile || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Radiography Mobile):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};



export const getReportHeaderCArm = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Build query - populate each field individually
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate("ExposureRateTableTopCArm")
            .populate("HighContrastResolutionCArm")
            .populate("LowContrastResolutionCArm")
            .populate("OutputConsistencyForCArm")
            .populate("TotalFilterationForCArm")
            .populate("TubeHousingLeakageCArm")
            .populate("LinearityOfmAsLoadingCArm")
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ C-ARM TEST RESULTS (POPULATED)
                ExposureRateTableTopCArm: report.ExposureRateTableTopCArm || null,
                HighContrastResolutionCArm: report.HighContrastResolutionCArm || null,
                LowContrastResolutionCArm: report.LowContrastResolutionCArm || null,
                OutputConsistencyForCArm: report.OutputConsistencyForCArm || null,
                TotalFilterationForCArm: report.TotalFilterationForCArm || null,
                TubeHousingLeakageCArm: report.TubeHousingLeakageCArm || null,
                LinearityOfmAsLoadingCArm: report.LinearityOfmAsLoadingCArm || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (C-Arm):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};

export const getReportHeaderInventionalRadiology = async (req, res) => {
    const { serviceId } = req.params;
    const { tubeId } = req.query; // Get tubeId from query parameter (optional): 'frontal', 'lateral', 'null', or undefined

    try {
        // Parse tubeId - handle 'frontal', 'lateral', 'null', or undefined
        // For single tube: tubeId should be 'null' or undefined (defaults to null)
        // For double tube: tubeId should be 'frontal' or 'lateral'
        let tubeIdValue = null;
        if (tubeId !== undefined && tubeId !== null) {
            if (tubeId === 'null' || tubeId === '') {
                tubeIdValue = null; // Single tube
            } else if (tubeId === 'frontal' || tubeId === 'lateral') {
                tubeIdValue = tubeId; // Tube Frontal or Tube Lateral
            } else {
                // Invalid tubeId value, default to null (single tube)
                tubeIdValue = null;
            }
        }

        // Build query - populate tools and tests that don't support tubeId (common tests)
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        // Query tests with tubeId support directly (using existing imports)
        // Build query based on tubeId: { serviceId, tubeId: 'frontal' | 'lateral' | null }
        const query = { serviceId, tubeId: tubeIdValue };

        // Query all tests with tubeId support in parallel (using mongoose.model to get registered models)
        const [
            centralBeamAlignment,
            effectiveFocalSpot,
            accuracyOfIrradiationTime,
            totalFilteration,
            consistencyOfRadiationOutput,
            lowContrastResolution,
            highContrastResolution,
            exposureRateTableTop,
            tubeHousingLeakage,
        ] = await Promise.all([
            mongoose.model("CentralBeamAlignmentInventionalRadiology").findOne(query).lean(),
            mongoose.model("EffectiveFocalSpotInventionalRadiology").findOne(query).lean(),
            mongoose.model("AccuracyOfIrradiationTimeInventionalRadiology").findOne(query).lean(),
            mongoose.model("TotalFilterationForInventionalRadiology").findOne(query).lean(),
            mongoose.model("ConsistencyOfRadiationOutputInventionalRadiology").findOne(query).lean(),
            mongoose.model("LowContrastResolutionInventionalRadiology").findOne(query).lean(),
            mongoose.model("HighContrastResolutionInventionalRadiology").findOne(query).lean(),
            mongoose.model("ExposureRateTableTopInventionalRadiology").findOne(query).lean(),
            mongoose.model("TubeHousingLeakageInventionalRadiology").findOne(query).lean(),
        ]);

        // Query common tests (Radiation Protection Survey - always with tubeId: null)
        const radiationProtectionSurvey = await mongoose.model("RadiationProtectionSurveyInventionalRadiology").findOne({ 
            serviceId, 
            tubeId: null 
        }).lean();

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                notes: report.notes || [],

                // ⭐ INTERVENTIONAL RADIOLOGY TEST RESULTS
                // Tests with tubeId support (queried directly)
                CentralBeamAlignmentInventionalRadiology: centralBeamAlignment || null,
                EffectiveFocalSpotInventionalRadiology: effectiveFocalSpot || null,
                AccuracyOfIrradiationTimeInventionalRadiology: accuracyOfIrradiationTime || null,
                TotalFilterationForInventionalRadiology: totalFilteration || null,
                ConsistencyOfRadiationOutputInventionalRadiology: consistencyOfRadiationOutput || null,
                LowContrastResolutionInventionalRadiology: lowContrastResolution || null,
                HighContrastResolutionInventionalRadiology: highContrastResolution || null,
                ExposureRateTableTopInventionalRadiology: exposureRateTableTop || null,
                TubeHousingLeakageInventionalRadiology: tubeHousingLeakage || null,
                // Common tests (no tubeId support - always tubeId: null)
                RadiationProtectionSurveyInventionalRadiology: radiationProtectionSurvey || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Interventional Radiology):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export const getReportHeaderLeadApron = async (req, res) => {
    const { serviceId } = req.params;

    try {
        const leadApronFields = [
            "LeadApronTest",
        ];

        let query = LeadApronServiceReport
            .findOne({ serviceId })
            .populate("toolsUsed.tool", "nomenclature make model");

        leadApronFields.forEach((field) => {
            query = query.populate(field);
        });

        const report = await query.lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName || "",
                address: report.address || "",
                srfNumber: report.srfNumber || "",
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber || "",
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature || "",
                make: report.make || "",
                model: report.model || "",
                category: report.category || "",
                slNumber: report.slNumber || "",
                condition: report.condition || "OK",
                testingProcedureNumber: report.testingProcedureNumber || "",
                engineerNameRPId: report.engineerNameRPId || "",
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location || "",
                temperature: report.temperature || "",
                humidity: report.humidity || "",

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature || "",
                    make: t.make || "",
                    model: t.model || "",
                    SrNo: t.SrNo || "",
                    range: t.range || "",
                    calibrationCertificateNo: t.calibrationCertificateNo || "",
                    calibrationValidTill: t.calibrationValidTill || "",
                    certificate: t.certificate || "",
                    uncertainity: t.uncertainity || "",
                })),

                // ⭐ LEAD APRON RESULTS
                LeadApronTest: report.LeadApronTest,

            },
        });
    } catch (error) {
        console.error("Get report header error (Lead Apron):", error);
        console.error("Error details:", error.stack);
        res.status(500).json({ exists: false, message: "Server error", error: error.message });
    }
};

export const saveReportHeaderLeadApron = async (req, res) => {
    const { serviceId } = req.params;
    const {
        customerName,
        address,
        srfNumber,
        srfDate,
        testReportNumber,
        issueDate,
        nomenclature,
        make,
        category,
        model,
        slNumber,
        condition,
        testingProcedureNumber,
        engineerNameRPId,
        pages,
        testDate,
        testDueDate,
        location,
        temperature,
        humidity,
        toolsUsed,
        notes,
    } = req.body;

    try {
        let report = await LeadApronServiceReport.findOne({ serviceId });
        if (!report) {
            // Create new report if it doesn't exist
            report = new LeadApronServiceReport({ serviceId });
        }

        // FORMAT TOOLS
        const formattedTools = toolsUsed?.map((tool) => ({
            tool: tool.toolId || null,
            SrNo: tool.SrNo,
            nomenclature: tool.nomenclature,
            make: tool.make,
            model: tool.model,
            range: tool.range,
            calibrationCertificateNo: tool.calibrationCertificateNo,
            calibrationValidTill: tool.calibrationValidTill,
            certificate: tool.certificate,
            uncertainity: tool.uncertainity,
        })) || [];

        // FORMAT NOTES
        const formattedNotes = notes?.map((n) => ({
            slNo: n.slNo,
            text: n.text,
        })) || [];

        // UPDATE HEADER FIELDS
        Object.assign(report, {
            customerName,
            address,
            srfNumber,
            srfDate: srfDate ? new Date(srfDate) : null,
            testReportNumber,
            issueDate: issueDate ? new Date(issueDate) : null,
            nomenclature,
            make,
            category,
            model,
            slNumber,
            condition,
            testingProcedureNumber,
            engineerNameRPId,
            pages,
            testDate: testDate ? new Date(testDate) : null,
            testDueDate: testDueDate ? new Date(testDueDate) : null,
            location,
            temperature,
            humidity,
            toolsUsed: formattedTools,
            notes: formattedNotes,
        });

        await report.save();

        return res.status(200).json({
            message: "Lead Apron report header saved successfully!",
            report,
        });

    } catch (error) {
        console.error("Save Lead Apron report header error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getReportHeaderOArm = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // Build query - populate each field individually
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate("ExposureRateTableTopOArm")
            .populate("HighContrastResolutionOArm")
            .populate("LowContrastResolutionOArm")
            .populate("OutputConsistencyForOArm")
            .populate("TotalFilterationForOArm")
            .populate("TubeHousingLeakageOArm")
            .populate("LinearityOfmAsLoadingOArm")
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ O-ARM TEST RESULTS (POPULATED)
                ExposureRateTableTopOArm: report.ExposureRateTableTopOArm || null,
                HighContrastResolutionOArm: report.HighContrastResolutionOArm || null,
                LowContrastResolutionOArm: report.LowContrastResolutionOArm || null,
                OutputConsistencyForOArm: report.OutputConsistencyForOArm || null,
                TotalFilterationForOArm: report.TotalFilterationForOArm || null,
                TubeHousingLeakageOArm: report.TubeHousingLeakageOArm || null,
                LinearityOfmAsLoadingOArm: report.LinearityOfmAsLoadingOArm || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (O-Arm):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export const getReportHeaderForCTScan = async (req, res) => {
    const { serviceId } = req.params;
    const { tubeId } = req.query; // Get tubeId from query parameter (optional): 'A', 'B', 'null', or undefined

    try {
        // Parse tubeId - handle 'A', 'B', 'null', or undefined
        // For single tube: tubeId should be 'null' or undefined (defaults to null)
        // For double tube: tubeId should be 'A' or 'B'
        let tubeIdValue = null;
        if (tubeId !== undefined && tubeId !== null) {
            if (tubeId === 'null' || tubeId === '') {
                tubeIdValue = null; // Single tube
            } else if (tubeId === 'A' || tubeId === 'B') {
                tubeIdValue = tubeId; // Tube A or Tube B
            } else {
                // Invalid tubeId value, default to null (single tube)
                tubeIdValue = null;
            }
        }

        // Build query - populate tools and tests that don't support tubeId
        const report = await serviceReportModel
            .findOne({ serviceId })
            .populate({ path: "toolsUsed.tool", select: "nomenclature make model" })
            .populate("GantryTiltCTScan")
            .populate("TablePositionCTScan")
            .populate("AlignmentOfTableGantryCTScan")
            .lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        // Query tests with tubeId support directly (using existing imports)
        // Build query based on tubeId: { serviceId, tubeId: 'A' | 'B' | null }
        const query = { serviceId, tubeId: tubeIdValue };

        // Query all tests with tubeId support in parallel
        const [
            radiationProfileWidth,
            measurementOfOperatingPotential,
            timerAccuracy,
            measurementOfMaLinearity,
            measurementOfCTDI,
            totalFilteration,
            radiationLeakageLevel,
            measureMaxRadiationLevel,
            outputConsistency,
            lowContrastResolution,
            highContrastResolution,
            linearityOfMasLoading,
            radiationProtectionSurvey,
        ] = await Promise.all([
            RadiationProfileWidth.findOne(query).lean(),
            MeasurementOfOperatingPotential.findOne(query).lean(),
            TimerAccuracy.findOne(query).lean(),
            MeasurementOfMaLinearity.findOne(query).lean(),
            MeasurementOfCTDI.findOne(query).lean(),
            TotalFilterationForCTScan.findOne(query).lean(),
            RadiationLeakageLeveFromXRayTube.findOne(query).lean(),
            MeasureMaxRadiationLevel.findOne(query).lean(),
            OutputConsistency.findOne(query).lean(),
            LowContrastResolutionForCTScan.findOne(query).lean(),
            HighContrastResolutionForCTScan.findOne(query).lean(),
            LinearityOfMasLoadingCTScan.findOne(query).lean(),
            RadiationProtectionSurveyCTScan.findOne(query).lean(),
        ]);

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ CT SCAN (COMPUTED TOMOGRAPHY) TEST RESULTS
                // Tests with tubeId support (queried directly)
                RadiationProfileWidthForCTScan: radiationProfileWidth || null,
                MeasurementOfOperatingPotential: measurementOfOperatingPotential || null,
                TimerAccuracy: timerAccuracy || null,
                MeasurementOfMaLinearity: measurementOfMaLinearity || null,
                MeasurementOfCTDI: measurementOfCTDI || null,
                TotalFilterationForCTScan: totalFilteration || null,
                RadiationLeakageLevel: radiationLeakageLevel || null,
                MeasureMaxRadiationLevel: measureMaxRadiationLevel || null,
                OutputConsistency: outputConsistency || null,
                lowContrastResolutionForCTScan: lowContrastResolution || null,
                HighContrastResolutionForCTScan: highContrastResolution || null,
                LinearityOfMasLoadingCTScan: linearityOfMasLoading || null,
                RadiationProtectionSurveyCTScan: radiationProtectionSurvey || null,
                // Tests without tubeId support (from ServiceReport populated reference)
                GantryTiltCTScan: report.GantryTiltCTScan || null,
                TablePositionCTScan: report.TablePositionCTScan || null,
                AlignmentOfTableGantryCTScan: report.AlignmentOfTableGantryCTScan || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (CT Scan):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export const getReportHeaderOBI = async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "serviceId is required",
            });
        }

        // All OBI fields
        const obiFields = [
            "AlignmentTestOBI",
            "accuracyOfOperatingPotentialOBI",
            "CentralBeamAlignmentOBI",
            "CongruenceOfRadiationOBI",
            "EffectiveFocalSpotOBI",
            "HighContrastSensitivityOBI",
            "LinearityOfMasLoadingStationsOBI",
            "LinearityOfTimeOBI",
            "LowContrastSensitivityOBI",
            "OutputConsistencyOBI",
            "RadiationProtectionSurveyOBI",
            "TimerTestOBI",
            "TubeHousingLeakageOBI"
        ];

        let query = serviceReportModel
            .findOne({ serviceId })
            .populate("toolsUsed.tool", "nomenclature make model");

        // Populate all OBI fields
        obiFields.forEach(field => {
            query = query.populate(field);
        });

        const report = await query.lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                // ⭐ OBI TEST RESULTS (POPULATED)
                AlignmentTestOBI: report.AlignmentTestOBI,
                accuracyOfOperatingPotentialOBI: report.accuracyOfOperatingPotentialOBI,
                CentralBeamAlignmentOBI: report.CentralBeamAlignmentOBI,
                CongruenceOfRadiationOBI: report.CongruenceOfRadiationOBI,
                EffectiveFocalSpotOBI: report.EffectiveFocalSpotOBI,
                HighContrastSensitivityOBI: report.HighContrastSensitivityOBI,
                LinearityOfMasLoadingStationsOBI: report.LinearityOfMasLoadingStationsOBI,
                LinearityOfTimeOBI: report.LinearityOfTimeOBI,
                LowContrastSensitivityOBI: report.LowContrastSensitivityOBI,
                OutputConsistencyOBI: report.OutputConsistencyOBI,
                RadiationProtectionSurveyOBI: report.RadiationProtectionSurveyOBI,
                TimerTestOBI: report.TimerTestOBI,
                TubeHousingLeakageOBI: report.TubeHousingLeakageOBI,
            },
        });
    } catch (error) {
        console.error("Get report header error (OBI):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export const getReportHeaderMammography = async (req, res) => {
    const { serviceId } = req.params;

    try {
        // All Mammography fields to populate
        const mammographyFields = [
            "AccuracyOfOperatingPotentialMammography",
            "TotalFilterationAndAlluminiumMammography",
            "ImagingPhantomMammography",
            "ReproducibilityOfRadiationOutputMammography",
            "RadiationLeakageLevelMammography",
            "DetailsOfRadiationProtectionMammography",
            "EquipmentSettingMammography",
            "MaximumRadiationLevelMammography",
            "LinearityOfMasLoadingMammography"
        ];
        // Build the query
        let query = serviceReportModel
            .findOne({ serviceId })
            .populate("toolsUsed.tool", "nomenclature make model");

        // Populate each Mammography field
        mammographyFields.forEach(field => {
            query = query.populate(field);
        });

        const report = await query.lean();

        if (!report) {
            return res.status(200).json({ exists: false });
        }

        const format = (date) =>
            date ? new Date(date).toISOString().split("T")[0] : "";

        res.status(200).json({
            exists: true,
            data: {
                customerName: report.customerName,
                address: report.address,
                srfNumber: report.srfNumber,
                srfDate: format(report.srfDate),
                testReportNumber: report.testReportNumber,
                issueDate: format(report.issueDate),
                nomenclature: report.nomenclature,
                make: report.make,
                model: report.model,
                category: report.category,
                slNumber: report.slNumber,
                condition: report.condition,
                testingProcedureNumber: report.testingProcedureNumber,
                engineerNameRPId: report.engineerNameRPId,
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location,
                temperature: report.temperature,
                humidity: report.humidity,

                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: i + 1,
                    toolId: t.tool?._id,
                    nomenclature: t.nomenclature,
                    make: t.make,
                    model: t.model,
                    SrNo: t.SrNo,
                    range: t.range,
                    calibrationCertificateNo: t.calibrationCertificateNo,
                    calibrationValidTill: t.calibrationValidTill,
                    certificate: t.certificate,
                    uncertainity: t.uncertainity,
                })),

                notes: report.notes || [],

                // ⭐ MAMMOGRAPHY TEST RESULTS (POPULATED OR NULL IF NOT AVAILABLE)
                AccuracyOfOperatingPotentialMammography: report.AccuracyOfOperatingPotentialMammography || null,
                TotalFilterationAndAlluminiumMammography: report.TotalFilterationAndAlluminiumMammography || null,
                ImagingPhantomMammography: report.ImagingPhantomMammography || null,
                ReproducibilityOfRadiationOutputMammography: report.ReproducibilityOfRadiationOutputMammography || null,
                RadiationLeakageLevelMammography: report.RadiationLeakageLevelMammography || null,
                DetailsOfRadiationProtectionMammography: report.DetailsOfRadiationProtectionMammography || null,
                EquipmentSettingMammography: report.EquipmentSettingMammography || null,
                MaximumRadiationLevelMammography: report.MaximumRadiationLevelMammography || null,
                LinearityOfMasLoadingMammography: report.LinearityOfMasLoadingMammography || null,
            },
        });
    } catch (error) {
        console.error("Get report header error (Mammography):", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};


export default { getCustomerDetails, getTools, getReportHeader, getReportHeaderCBCT, getReportHeaderOPG, getReportHeaderDentalIntra, getReportHeaderDentalHandHeld, getReportHeaderRadiographyFixed, getReportHeaderRadiographyMobileHT, getReportHeaderRadiographyPortable, getReportHeaderRadiographyMobile, getReportHeaderCArm, getReportHeaderLeadApron, saveReportHeader, saveReportHeaderLeadApron, getReportHeaderForCTScan, getReportHeaderOArm, getReportHeaderOBI, getReportHeaderMammography, getReportHeaderInventionalRadiology }