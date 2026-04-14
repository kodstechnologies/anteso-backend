import mongoose from "mongoose";
import ReproducibilityOfOutputMmmography from "../../../../models/testTables/Mammography/ReproducibilityOfOutput.model.js"; // Adjust path if needed
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Mammography";

/** CoV limit as decimal (e.g. 0.05 max). Values >1 interpreted as percent (5 → 0.05). */
const parseToleranceToDecimal = (tolerance) => {
    const t = parseFloat(tolerance);
    if (isNaN(t) || t < 0) return 0.05;
    if (t <= 1) return t;
    return t / 100;
};

const compareCoVToTolerance = (cov, tolDecimal, operator = '<=') => {
    const tol = tolDecimal;
    switch (String(operator || '<=')) {
        case '<':
            return cov < tol;
        case '>':
            return cov > tol;
        case '<=':
            return cov <= tol;
        case '>=':
            return cov >= tol;
        case '=':
            return Math.abs(cov - tol) < 1e-6;
        default:
            return cov <= tol;
    }
};

// Helper function to calculate CV and remark for a row
const calculateCVAndRemark = (outputs, tolerance, toleranceOperator = '<=') => {
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

    const tolDecimal = parseToleranceToDecimal(tolerance);
    const passes = compareCoVToTolerance(cov, tolDecimal, toleranceOperator);

    return {
        avg: mean.toFixed(4),
        cov: cov.toFixed(4),
        remark: passes ? 'Pass' : 'Fail',
    };
};

// CREATE - First time save (rejects if already exists)
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { outputRows, tolerance, toleranceOperator, fdd } = req.body;
    const tolOp = toleranceOperator != null && toleranceOperator !== '' ? String(toleranceOperator) : '<=';

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Validate Service & Machine Type
        const service = await Service.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: ${service.machineType}`,
            });
        }

        // 2. Get or Create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        // Process outputRows to calculate avg, cov, and remark
        const processedRows = (outputRows || []).map(row => {
            const calc = calculateCVAndRemark(row.outputs || [], tolerance || '0.05', tolOp);
            return {
                kv: row.kv || '',
                mas: row.mas || '',
                outputs: row.outputs || [],
                avg: calc.avg,
                cov: calc.cov,
                remark: calc.remark,
            };
        });

        // 3. Upsert Test Record
        let testRecord = await ReproducibilityOfOutputMmmography.findOne({ serviceId }).session(session);

        if (testRecord) {
            testRecord.outputRows = processedRows;
            testRecord.tolerance = tolerance != null && tolerance !== '' ? String(tolerance) : '0.05';
            testRecord.toleranceOperator = tolOp;
            if (fdd !== undefined) testRecord.fdd = fdd == null ? '' : String(fdd);
            testRecord.updatedAt = Date.now();
        } else {
            testRecord = new ReproducibilityOfOutputMmmography({
                serviceId,
                reportId: serviceReport._id,
                fdd: fdd == null ? '' : String(fdd),
                outputRows: processedRows,
                tolerance: tolerance != null && tolerance !== '' ? String(tolerance) : '0.05',
                toleranceOperator: tolOp,
            });
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.ReproducibilityOfRadiationOutputMammography = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Reproducibility of Output test saved successfully",
            data: testRecord,
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
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

    const updateTolOp =
        updateData.toleranceOperator != null && updateData.toleranceOperator !== ''
            ? String(updateData.toleranceOperator)
            : null;

    // Process outputRows to recalculate avg, cov, and remark if provided
    if (updateData.outputRows && Array.isArray(updateData.outputRows)) {
        const tolForCalc = updateData.tolerance != null && updateData.tolerance !== '' ? String(updateData.tolerance) : '0.05';
        const opForCalc = updateTolOp || '<=';
        updateData.outputRows = updateData.outputRows.map(row => {
            const calc = calculateCVAndRemark(row.outputs || [], tolForCalc, opForCalc);
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

    if (updateTolOp) {
        updateData.toleranceOperator = updateTolOp;
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