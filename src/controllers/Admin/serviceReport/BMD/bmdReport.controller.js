import LinkServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import AccuracyOfOperatingPotentialAndTime from "../../../../models/testTables/BMD/AccuracyOfOperatingPotentialAndTime.model.js";
import ConsistencyOfRadiationOutput from "../../../../models/testTables/BMD/ConsistencyOfRadiationOutput.model.js";
import LinearityOfMaLoading from "../../../../models/testTables/BMD/LinearityOfMasLoading.model.js";
import TubeHousingLeakage from "../../../../models/testTables/BMD/TubeHousing.model.js";
import RadiationProtection from "../../../../models/testTables/BMD/DetailsOfRadiationProtection.model.js";
import TotalFilteration from "../../../../models/testTables/BMD/TotalFilteration.model.js";
import mongoose from "mongoose";

// SAVE/UPDATE Report Header for BMD
export const saveReportHeader = async (req, res) => {
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
        model,
        slNumber,
        category,
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
        let report = await LinkServiceReport.findOne({ serviceId });
        if (!report) {
            return res.status(404).json({
                message: "ServiceReport not found. Please generate the test report first.",
            });
        }

        // FORMAT TOOLS
        const formattedTools =
            toolsUsed?.map((tool) => {
                let toolId = null;
                if (tool.toolId) {
                    if (
                        mongoose.Types.ObjectId.isValid(tool.toolId) &&
                        typeof tool.toolId === "string" &&
                        tool.toolId.length === 24
                    ) {
                        toolId = tool.toolId;
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
        const formattedNotes =
            notes?.map((n) => ({
                slNo: n.slNo,
                text: n.text,
            })) || [];

        // FIND LATEST TEST RECORDS FOR THIS serviceId
        const [
            accuracyOp,
            reproducibility,
            linearityMa,
            tubeLeakage,
            radProtection,
            totalFiltration,
        ] = await Promise.all([
            AccuracyOfOperatingPotentialAndTime.findOne({ serviceId }).sort({
                createdAt: -1,
            }),
            ConsistencyOfRadiationOutput.findOne({ serviceId }).sort({ createdAt: -1 }),
            LinearityOfMaLoading.findOne({ serviceId }).sort({ createdAt: -1 }),
            TubeHousingLeakage.findOne({ serviceId }).sort({ createdAt: -1 }),
            RadiationProtection.findOne({ serviceId }).sort({ createdAt: -1 }),
            TotalFilteration.findOne({ serviceId }).sort({ createdAt: -1 }),
        ]);

        // UPDATE REPORT
        Object.assign(report, {
            customerName,
            address,
            srfNumber,
            srfDate: srfDate ? new Date(srfDate) : null,
            testReportNumber,
            issueDate: issueDate ? new Date(issueDate) : null,
            nomenclature,
            make,
            model,
            slNumber,
            category,
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

            // Link new BMD fields
            AccuracyOfOperatingPotentialAndTimeBMD: accuracyOp?._id || null,
            ReproducibilityOfRadiationOutputBMD: reproducibility?._id || null,
            LinearityOfMaLoadingBMD: linearityMa?._id || null,
            TubeHousingLeakageBMD: tubeLeakage?._id || null,
            RadiationProtectionSurveyBMD: radProtection?._id || null,
            TotalFilterationBMD: totalFiltration?._id || null,
        });

        await report.save();

        return res.status(200).json({
            success: true,
            message: "BMD Report header saved successfully!",
            report,
        });
    } catch (error) {
        console.error("Save BMD report header error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// GET Report Header for BMD (Populating specific fields)
export const getReportHeader = async (req, res) => {
    const { serviceId } = req.params;

    try {
        const report = await LinkServiceReport.findOne({ serviceId })
            .populate("toolsUsed.tool", "nomenclature make model")
            .populate("AccuracyOfOperatingPotentialAndTimeBMD")
            .populate("ReproducibilityOfRadiationOutputBMD")
            .populate("LinearityOfMaLoadingBMD")
            .populate("TubeHousingLeakageBMD")
            .populate("RadiationProtectionSurveyBMD")
            .populate("TotalFilterationBMD")
            .lean();

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
                slNumber: report.slNumber || "",
                category: report.category || "",
                condition: report.condition || "OK",
                testingProcedureNumber: report.testingProcedureNumber || "",
                engineerNameRPId: report.engineerNameRPId || "",
                pages: report.pages || "",
                testDate: format(report.testDate),
                testDueDate: format(report.testDueDate),
                location: report.location || "",
                temperature: report.temperature || "",
                humidity: report.humidity || "",
                toolsUsed: (report.toolsUsed || []).map((t, i) => ({
                    slNumber: String(i + 1),
                    toolId: t.tool?._id || null,
                    // Prefer populated tool data over embedded fallback
                    nomenclature: t.tool?.nomenclature || t.nomenclature || "",
                    make: t.tool?.make || t.make || "",
                    model: t.tool?.model || t.model || "",
                    SrNo: t.SrNo || "",
                    range: t.range || "",
                    calibrationCertificateNo: t.calibrationCertificateNo || "",
                    calibrationValidTill: t.calibrationValidTill || "",
                    certificate: t.certificate || "",
                    uncertainity: t.uncertainity || "",
                })),
                notes: report.notes || [],

                notes: report.notes || [],

                // Populated BMD test data with fallbacks
                accuracyOfOperatingPotential: report.AccuracyOfOperatingPotentialAndTimeBMD || await AccuracyOfOperatingPotentialAndTime.findOne({ serviceId }),
                reproducibilityOfRadiationOutput: report.ReproducibilityOfRadiationOutputBMD || await ConsistencyOfRadiationOutput.findOne({ serviceId }),
                linearityOfMaLoading: report.LinearityOfMaLoadingBMD || await LinearityOfMaLoading.findOne({ serviceId }),
                tubeHousingLeakage: report.TubeHousingLeakageBMD || await TubeHousingLeakage.findOne({ serviceId }),
                radiationProtectionSurvey: report.RadiationProtectionSurveyBMD || await RadiationProtection.findOne({ serviceId }),
                totalFiltration: report.TotalFilterationBMD || await TotalFilteration.findOne({ serviceId }),
            },
        });
    } catch (error) {
        console.error("Get BMD report header error:", error);
        res.status(500).json({ exists: false, message: "Server error" });
    }
};

export default { saveReportHeader, getReportHeader };
