import orderModel from "../../../models/order.model.js";
import QATest from "../../../models/QATest.model.js";
import serviceReportModel from "../../../models/serviceReports/serviceReport.model.js";
import Services from "../../../models/Services.js";
import MeasurementOfMaLinearity from "../../../models/testTables/CTScan/measurementOfMaLinearity.model.js";
import MeasurementOfOperatingPotential from "../../../models/testTables/CTScan/MeasurementOfOperatingPotential.model.js";
import RadiationProfileWidth from "../../../models/testTables/CTScan/RadiationProfileWidth.model.ForCTScan.js";
import TimerAccuracy from "../../../models/testTables/CTScan/TimerAccuracy.model.js";
import MeasurementOfCTDI from "../../../models/testTables/CTScan/measurementOfCTDI.model.js";
import Tools from "../../../models/tools.model.js";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import TotalFilterationForCTScan from "../../../models/testTables/CTScan/TotalFilterationForCTScan.js";
import RadiationLeakageLeveFromXRayTube from "../../../models/testTables/CTScan/radiationLeakageLevelFromXRayTubeHouse.model.js";
import outputConsistencyForCtScanModel from "../../../models/testTables/CTScan/outputConsistencyForCtScan.model.js";

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


export default { getCustomerDetails, getTools, getReportHeader, getReportHeaderCBCT, getReportHeaderOPG, saveReportHeader }