// controllers/OutputConsistencyForOArmController.js
import OutputConsistencyForOArm from "../../../../models/testTables/OArm/OutputConsisitency.model.js";
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
        return res.status(400).json({ success: false, message: "Valid Service ID is required" });
    }

    if (!outputRows || !Array.isArray(outputRows) || outputRows.length === 0) {
        return res.status(400).json({ success: false, message: "At least one output row is required" });
    }

    // Validate kVp + mA
    for (const row of outputRows) {
        if (!row.kvp?.trim() || !row.ma?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Each row must have both kVp and mA",
            });
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingTest = await OutputConsistencyForOArm.findOne({ serviceId }).session(session);
        if (existingTest) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: "Output Consistency test already exists for this machine",
            });
        }

        const newTest = await OutputConsistencyForOArm.create(
            [{
                serviceId,
                reportId: reportId || null,
                parameters: {
                    ffd: parameters?.ffd?.toString().trim() || "100",
                    time: parameters?.time?.toString().trim() || "1.0",
                },
                outputRows: outputRows.map(row => ({
                    kvp: row.kvp?.toString().trim(),
                    ma: row.ma?.toString().trim(),
                    outputs: row.outputs?.map(o => o?.toString().trim() || "") || [],
                    mean: row.mean || "",
                    cov: row.cov || "",
                    remark: row.remark || "",
                })),
                measurementHeaders: Array.isArray(measurementHeaders) && measurementHeaders.length > 0
                    ? measurementHeaders
                    : ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
                tolerance: tolerance?.toString().trim() || "0.02",
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
        console.error("Create failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create test",
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

    const test = await OutputConsistencyForOArm.findById(testId)
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

    const test = await OutputConsistencyForOArm.findOne({ serviceId })
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
    const {
        parameters,
        outputRows,
        measurementHeaders,
        tolerance,
        finalRemark
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Invalid Test ID" });
    }

    if (!outputRows || !Array.isArray(outputRows) || outputRows.length === 0) {
        return res.status(400).json({ success: false, message: "At least one output row is required" });
    }

    for (const row of outputRows) {
        if (!row.kvp?.trim() || !row.ma?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Each row must have both kVp and mA values",
            });
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedTest = await OutputConsistencyForOArm.findByIdAndUpdate(
            testId,
            {
                parameters: {
                    ffd: parameters?.ffd?.toString().trim(),
                    time: parameters?.time?.toString().trim(),
                },
                outputRows: outputRows.map(row => ({
                    kvp: row.kvp?.toString().trim(),
                    ma: row.ma?.toString().trim(),
                    outputs: row.outputs?.map(o => o?.toString().trim() || "") || [],
                    mean: row.mean || "",
                    cov: row.cov || "",
                })),
                measurementHeaders: Array.isArray(measurementHeaders) && measurementHeaders.length > 0
                    ? measurementHeaders
                    : ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
                tolerance: tolerance?.toString().trim() || "2.0",
                finalRemark: finalRemark || "",
                updatedAt: Date.now(),
            },
            { new: true, runValidators: true, session }
        );

        if (!updatedTest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Updated successfully",
            data: updatedTest,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Update failed:", error);
        return res.status(500).json({ success: false, message: "Failed to update test" });
    }
});

export default {
    create,
    getById,
    getByServiceId,
    update,
};
