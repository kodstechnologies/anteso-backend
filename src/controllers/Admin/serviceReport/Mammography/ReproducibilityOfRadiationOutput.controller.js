// controllers/ReproducibilityOfOutput.js
import mongoose from "mongoose";
import ReproducibilityOfOutputMmmography from "../../../../models/testTables/Mammography/ReproducibilityOfOutput.model.js"; // Adjust path if needed
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

// CREATE - First time save (rejects if already exists)
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { outputRows, tolerance } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existing = await ReproducibilityOfOutputMmmography.findOne({ serviceId, isDeleted: false }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Reproducibility of Output test already exists for this service" });
        }

        const newTest = await ReproducibilityOfOutputMmmography.create([{
            serviceId,
            ffd: req.body.ffd || null,
            outputRows: outputRows || [],
            tolerance: tolerance || null,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Reproducibility of Output test created successfully",
            data: newTest[0],
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

// GET BY SERVICE ID → returns 404 (frontend gets null)
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    const testData = await ReproducibilityOfOutputMmmography.findOne({
        serviceId,
        isDeleted: false
    }).lean();

    if (!testData) {
        return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

// GET BY TEST ID (legacy support)
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Invalid testId" });
    }

    const testData = await ReproducibilityOfOutputMmmography.findOne({
        _id: testId,
        isDeleted: false
    }).lean();

    if (!testData) {
        return res.status(404).json({ success: false, message: "Test not found" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

// UPDATE - By testId
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const updateData = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    // Prevent modifying serviceId
    delete updateData.serviceId;
    delete updateData.createdAt;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedTest = await ReproducibilityOfOutputMmmography.findOneAndUpdate(
            { _id: testId, isDeleted: false },
            { $set: { ...updateData, updatedAt: Date.now() } },
            { new: true, runValidators: true, session }
        );

        if (!updatedTest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Test not found or deleted" });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Reproducibility of Output test updated successfully",
            data: updatedTest,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

export default {
    create,
    getById,
    update,
    getByServiceId,
};