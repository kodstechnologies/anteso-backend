// controllers/TotalFilteration.js
import mongoose from "mongoose";
import TotalFilterationAndAlluminiumMammography from "../../../../models/testTables/Mammography/TotalFiltrationAndAluminium.model.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

// CREATE - With Transaction
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        targetWindow,
        addedFilterThickness,
        table,
        resultHVT28kVp,
        hvlTolerances,
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }
    if (!targetWindow?.trim()) {
        return res.status(400).json({ message: "targetWindow is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check existing within transaction
        const existing = await TotalFilterationAndAlluminiumMammography.findOne({ serviceId }).session(session);
        if (existing) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Total Filtration data already exists for this service" });
        }

        const newTest = await TotalFilterationAndAlluminiumMammography.create(
            [{
                serviceId,
                targetWindow: targetWindow.trim(),
                addedFilterThickness: addedFilterThickness?.trim() || null,
                table: table || [],
                resultHVT28kVp: resultHVT28kVp || null,
                hvlTolerances: hvlTolerances || {
                    at30: { operator: ">=", value: null },
                    at40: { operator: ">=", value: null },
                    at50: { operator: ">=", value: null },
                },
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Total Filtration test created successfully",
            data: newTest[0],
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error; // asyncHandler will catch
    }
});

// GET BY SERVICE ID - No transaction needed (read-only)
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const testData = await TotalFilterationAndAlluminiumMammography.findOne({ serviceId }).lean();

    if (!testData) {
        return res.status(404).json({ message: "No Total Filtration data found for this service" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

// GET BY TEST ID
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Invalid testId" });
    }

    const testData = await TotalFilterationAndAlluminiumMammography.findById(testId).lean();

    if (!testData) {
        return res.status(404).json({ message: "Total Filtration test not found" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

// UPDATE - With Transaction
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const updateData = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Valid testId is required" });
    }

    // Prevent changing serviceId
    delete updateData.serviceId;
    delete updateData.createdAt;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedTest = await TotalFilterationAndAlluminiumMammography.findByIdAndUpdate(
            testId,
            {
                $set: {
                    ...updateData,
                    updatedAt: Date.now(),
                },
            },
            { new: true, runValidators: true, session }
        );

        if (!updatedTest) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Total Filtration test not found" });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Total Filtration test updated successfully",
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