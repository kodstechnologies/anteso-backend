// controllers/ReproducibilityOfOutput.js
import mongoose from "mongoose";
import ReproducibilityOfOutputMmmography from "../../../../models/testTables/Mammography/ReproducibilityOfOutput.model.js"; // Adjust path if needed
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

// Helper function to calculate CV and remark for a row
const calculateCVAndRemark = (outputs, tolerance) => {
    const nums = outputs
        .filter((v) => v && v.trim() !== '')
        .map((v) => parseFloat(v))
        .filter((n) => !isNaN(n) && n > 0);

    if (nums.length === 0) {
        return { avg: '', cov: '', remark: '' };
    }

    const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
    
    let cov = 0;
    if (nums.length > 1) {
        const variance =
            nums.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            nums.length;
        const stdDev = Math.sqrt(variance);
        cov = mean > 0 ? stdDev / mean : 0; // CoV as decimal
    }

    // Tolerance is stored as percentage (e.g., "5.0" for 5%)
    const tolValuePercent = parseFloat(tolerance) || 5.0;
    const tolValueDecimal = tolValuePercent / 100; // Convert to decimal

    // Compare CoV (decimal) with tolerance (decimal)
    const passes = cov <= tolValueDecimal;

    return {
        avg: mean.toFixed(4),
        cov: cov.toFixed(4),
        remark: passes ? 'Pass' : 'Fail',
    };
};

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

        // Process outputRows to calculate avg, cov, and remark
        const processedRows = (outputRows || []).map(row => {
            const calc = calculateCVAndRemark(row.outputs || [], tolerance || '5.0');
            return {
                kv: row.kv || '',
                mas: row.mas || '',
                outputs: row.outputs || [],
                avg: calc.avg,
                cov: calc.cov,
                remark: calc.remark,
            };
        });

        const newTest = await ReproducibilityOfOutputMmmography.create([{
            serviceId,
            outputRows: processedRows,
            tolerance: tolerance || '5.0',
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
    const updateData = { ...req.body };

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    // Prevent modifying serviceId
    delete updateData.serviceId;
    delete updateData.createdAt;

    // Process outputRows to recalculate avg, cov, and remark if provided
    if (updateData.outputRows && Array.isArray(updateData.outputRows)) {
        updateData.outputRows = updateData.outputRows.map(row => {
            const calc = calculateCVAndRemark(row.outputs || [], updateData.tolerance || '5.0');
            return {
                kv: row.kv || '',
                mas: row.mas || '',
                outputs: row.outputs || [],
                avg: calc.avg,
                cov: calc.cov,
                remark: calc.remark,
            };
        });
    }

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