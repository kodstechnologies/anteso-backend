// controllers/ImagingPhantom.js
import { asyncHandler } from '../../../../utils/AsyncHandler.js';
import ImagingPhantomMammography from '../../../../models/testTables/Mammography/ImagingPhantom.model.js';
import mongoose from 'mongoose';

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { rows } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId is required in URL params',
        });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'At least one phantom row with name, visibleCount, and tolerance is required',
        });
    }

    // Validate each row
    for (const row of rows) {
        if (!row.name || typeof row.visibleCount !== 'number' || !row.tolerance?.operator || typeof row.tolerance?.value !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Each row must have name, visibleCount (number), and tolerance { operator, value }',
            });
        }
    }

    // Prevent duplicate test for same service
    const existing = await ImagingPhantomMammography.findOne({
        serviceId,
    }).lean();

    if (existing) {
        return res.status(400).json({
            success: false,
            message: 'Imaging Phantom test already exists for this service',
        });
    }

    // Calculate remark for each row and overall remark
    const rowsWithRemarks = rows.map(row => {
        const { operator, value } = row.tolerance;
        const visible = row.visibleCount;

        let passes = false;
        switch (operator) {
            case '>': passes = visible > value; break;
            case '>=': passes = visible >= value; break;
            case '<': passes = visible < value; break;
            case '<=': passes = visible <= value; break;
            case '=': passes = visible === value; break;
            default: passes = false;
        }

        return {
            ...row,
            remark: passes ? 'Pass' : 'Fail',
        };
    });

    // Calculate overall remark
    const remark = rowsWithRemarks.every(row => row.remark === 'Pass') ? 'Pass' : 'Fail';

    const newTest = await ImagingPhantomMammography.create({
        serviceId,
        rows: rowsWithRemarks,
        remark,
    });

    return res.status(201).json({
        success: true,
        message: 'Imaging Phantom test created successfully',
        data: newTest,
    });
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId is required',
        });
    }

    const test = await ImagingPhantomMammography.findOne({ serviceId }).lean();

    if (!test) {
        return res.status(404).json({
            success: false,
            message: 'Imaging Phantom test not found for this service',
        });
    }

    return res.status(200).json({
        success: true,
        data: test,
    });
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid testId is required',
        });
    }

    const test = await ImagingPhantomMammography.findById(testId).lean();

    if (!test) {
        return res.status(404).json({
            success: false,
            message: 'Imaging Phantom test not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: test,
    });
});

const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { rows } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid testId is required',
        });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Rows array is required',
        });
    }

    // Recalculate remark for each row and overall remark
    const rowsWithRemarks = rows.map(row => {
        const { operator, value } = row.tolerance;
        const visible = row.visibleCount;

        let passes = false;
        switch (operator) {
            case '>': passes = visible > value; break;
            case '>=': passes = visible >= value; break;
            case '<': passes = visible < value; break;
            case '<=': passes = visible <= value; break;
            case '=': passes = visible === value; break;
            default: passes = false;
        }

        return {
            ...row,
            remark: passes ? 'Pass' : 'Fail',
        };
    });

    // Calculate overall remark
    const remark = rowsWithRemarks.every(row => row.remark === 'Pass') ? 'Pass' : 'Fail';

    const updatedTest = await ImagingPhantomMammography.findByIdAndUpdate(
        testId,
        {
            $set: {
                rows: rowsWithRemarks,
                remark,
                updatedAt: Date.now(),
            },
        },
        { new: true, runValidators: true }
    );

    if (!updatedTest) {
        return res.status(404).json({
            success: false,
            message: 'Imaging Phantom test not found',
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Imaging Phantom test updated successfully',
        data: updatedTest,
    });
});

export default {
    create,
    getById,
    update,
    getByServiceId,
};