// controllers/ExposureRateController.js
import ExposureRateTableTop from "../../../../models/testTables/OArm/ExposureRateTableTop.model.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

// CREATE - With Transaction
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        rows = [],
        nonAecTolerance,
        aecTolerance,
        minFocusDistance,
        reportId
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "Valid Service ID is required",
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Prevent duplicate test for same service
        const existing = await ExposureRateTableTop.findOne({ serviceId }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Exposure Rate test already exists for this machine",
            });
        }

        const newTest = await ExposureRateTableTop.create(
            [{
                serviceId,
                reportId: reportId || null,
                rows: rows.map(row => ({
                    distance: row.distance?.toString().trim() || "",
                    appliedKv: row.appliedKv?.toString().trim() || "",
                    appliedMa: row.appliedMa?.toString().trim() || "",
                    exposure: row.exposure?.toString().trim() || "",
                    remark: row.remark?.trim() || "",
                })),
                nonAecTolerance: nonAecTolerance?.toString().trim() || "",
                aecTolerance: aecTolerance?.toString().trim() || "",
                minFocusDistance: minFocusDistance?.toString().trim() || "",
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Exposure Rate test created successfully",
            data: newTest[0],
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Create Exposure Rate failed:", error);
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

    const test = await ExposureRateTableTop.findById(testId)
        .populate("serviceId", "machineName serialNumber manufacturer model")
        .populate("reportId", "reportNumber createdAt");

    if (!test) {
        return res.status(404).json({
            success: false,
            message: "Exposure Rate test not found",
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

    const test = await ExposureRateTableTop.findOne({ serviceId })
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
        rows = [],
        nonAecTolerance,
        aecTolerance,
        minFocusDistance
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Test ID",
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedTest = await ExposureRateTableTop.findByIdAndUpdate(
            testId,
            {
                rows: rows.map(row => ({
                    distance: row.distance?.toString().trim() || "",
                    appliedKv: row.appliedKv?.toString().trim() || "",
                    appliedMa: row.appliedMa?.toString().trim() || "",
                    exposure: row.exposure?.toString().trim() || "",
                    remark: row.remark?.trim() || "",
                })),
                nonAecTolerance: nonAecTolerance?.toString().trim() || "",
                aecTolerance: aecTolerance?.toString().trim() || "",
                minFocusDistance: minFocusDistance?.toString().trim() || "",
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
            message: "Exposure Rate test updated successfully",
            data: updatedTest,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Update Exposure Rate failed:", error);
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
