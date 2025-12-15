// controllers/HighContrastResolutionController.js
import HighContrastResolution from "../../../../models/testTables/CArm/HighContrastResolution.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "C-Arm";

// CREATE - With Transaction
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { measuredLpPerMm, recommendedStandard, tolerance, reportId } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "Valid Service ID is required",
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate service & machine
        const service = await Service.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                success: false,
                message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: ${service.machineType}`,
            });
        }

        // Get or create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        // Auto compute remark: PASS if measured >= recommended (after applying tolerance logic if needed)
        let remark = "";
        const measured = parseFloat(measuredLpPerMm);
        const recommended = parseFloat(recommendedStandard || "1.50");

        if (!isNaN(measured) && !isNaN(recommended)) {
            remark = measured >= recommended ? "PASS" : "FAIL";
        }

        const newTest = await HighContrastResolution.create(
            [{
                serviceId,
                reportId: reportId || serviceReport._id,
                measuredLpPerMm: measuredLpPerMm?.toString().trim() || "",
                recommendedStandard: recommendedStandard?.toString().trim() || "1.50",
                tolerance: tolerance?.toString().trim() || "",
                remark,
            }],
            { session }
        );

        // Link to ServiceReport
        serviceReport.HighContrastResolutionCArm = newTest[0]._id;
        await serviceReport.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "High Contrast Resolution test created successfully",
            data: newTest[0],
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Create High Contrast Resolution failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create test. Please try again.",
        });
    }
});

// GET BY TEST ID
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Test ID",
        });
    }

    const test = await HighContrastResolution.findById(testId)
        .populate("serviceId", "machineName serialNumber manufacturer model")
        .populate("reportId", "reportNumber createdAt");

    if (!test) {
        return res.status(404).json({
            success: false,
            message: "High Contrast Resolution test not found",
        });
    }

    return res.status(200).json({
        success: true,
        data: test,
    });
});

// GET BY SERVICE ID (returns null if not exists)
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Service ID",
        });
    }

    const test = await HighContrastResolution.findOne({ serviceId })
        .populate("serviceId", "machineName serialNumber manufacturer model")
        .populate("reportId", "reportNumber");

    return res.status(200).json({
        success: true,
        data: test || null,
    });
});

// UPDATE - With Transaction
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { measuredLpPerMm, recommendedStandard, tolerance } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Test ID",
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const measured = parseFloat(measuredLpPerMm);
        const recommended = parseFloat(recommendedStandard || "1.50");
        let remark = "";

        if (!isNaN(measured) && !isNaN(recommended)) {
            remark = measured >= recommended ? "PASS" : "FAIL";
        }

        const updatedTest = await HighContrastResolution.findByIdAndUpdate(
            testId,
            {
                measuredLpPerMm: measuredLpPerMm?.toString().trim() || "",
                recommendedStandard: recommendedStandard?.toString().trim() || "1.50",
                tolerance: tolerance?.toString().trim() || "",
                remark,
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true, session }
        );

        if (!updatedTest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }

        // Ensure ServiceReport link exists
        if (updatedTest?.serviceId) {
            const serviceReport = await ServiceReport.findOne({ serviceId: updatedTest.serviceId }).session(session);
            if (serviceReport && (!serviceReport.HighContrastResolutionCArm || serviceReport.HighContrastResolutionCArm.toString() !== testId)) {
                serviceReport.HighContrastResolutionCArm = testId;
                await serviceReport.save({ session });
            }
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "High Contrast Resolution test updated successfully",
            data: updatedTest,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Update High Contrast Resolution failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update test. Please try again.",
        });
    }
});

export default {
    create,
    getById,
    getByServiceId,
    update,
};