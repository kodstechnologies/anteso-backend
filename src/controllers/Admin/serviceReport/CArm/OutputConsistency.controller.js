// controllers/OutputConsistencyForCArmController.js
import OutputConsistencyForCArm from "../../../../models/testTables/CArm/OutputConsisitency.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

// CREATE - With Transaction
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        parameters,
        outputRows,
        measurementHeaders,
        tolerance,
        finalRemark,
        reportId
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "Valid Service ID is required",
        });
    }

    if (!outputRows || !Array.isArray(outputRows) || outputRows.length === 0) {
        return res.status(400).json({
            success: false,
            message: "At least one output row is required",
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check for existing test inside transaction
        const existingTest = await OutputConsistencyForCArm.findOne({ serviceId }).session(session);
        if (existingTest) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Output Consistency test already exists for this machine",
            });
        }

        const newTest = await OutputConsistencyForCArm.create(
            [{
                serviceId,
                reportId: reportId || null,
                parameters: {
                    mas: parameters?.mas?.toString().trim() || "",
                    sliceThickness: parameters?.sliceThickness?.toString().trim() || "",
                    time: parameters?.time?.toString().trim() || "",
                },
                outputRows,
                measurementHeaders: measurementHeaders && Array.isArray(measurementHeaders)
                    ? measurementHeaders
                    : ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
                tolerance: tolerance?.toString().trim() || "",
                finalRemark: finalRemark || "",
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Output Consistency test created successfully",
            data: newTest[0],
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Create Output Consistency failed:", error);
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

    const test = await OutputConsistencyForCArm.findById(testId)
        .populate("serviceId", "machineName serialNumber manufacturer model")
        .populate("reportId", "reportNumber createdAt");

    if (!test) {
        return res.status(404).json({
            success: false,
            message: "Output Consistency test not found",
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

    const test = await OutputConsistencyForCArm.findOne({ serviceId })
        .populate("serviceId", "machineName serialNumber manufacturer model")
        .populate("reportId", "reportNumber");

    return res.status(200).json({
        success: true,
        data: test || null, // Explicitly return null when not found
    });
});

// UPDATE - With Transaction
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const {
        parameters,
        outputRows,
        measurementHeaders,
        tolerance,
        finalRemark
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Test ID",
        });
    }

    if (!outputRows || !Array.isArray(outputRows) || outputRows.length === 0) {
        return res.status(400).json({
            success: false,
            message: "At least one output row is required",
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedTest = await OutputConsistencyForCArm.findByIdAndUpdate(
            testId,
            {
                parameters: {
                    mas: parameters?.mas?.toString().trim() || "",
                    sliceThickness: parameters?.sliceThickness?.toString().trim() || "",
                    time: parameters?.time?.toString().trim() || "",
                },
                outputRows,
                measurementHeaders: measurementHeaders && Array.isArray(measurementHeaders)
                    ? measurementHeaders
                    : ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
                tolerance: tolerance?.toString().trim() || "",
                finalRemark: finalRemark || "",
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

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Output Consistency test updated successfully",
            data: updatedTest,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Update Output Consistency failed:", error);
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