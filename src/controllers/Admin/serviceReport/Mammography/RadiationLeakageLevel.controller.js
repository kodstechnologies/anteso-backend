// controllers/RadiationLeakageLevel.js
import { asyncHandler } from '../../../../utils/AsyncHandler.js';
import RadiationLeakageLevelMammography from '../../../../models/testTables/Mammography/RadiationLeakageLevel.model.js';
import mongoose from 'mongoose';

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        distanceFromFocus,
        kv,
        ma,
        time,
        workload,
        leakageLocations,
        highestLeakageMR,
        highestLeakageMGy,
        finalRemark,
        toleranceArea,
        toleranceDimension,
        toleranceDistance,
        toleranceLimit,
        toleranceTime,
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId is required in URL params',
        });
    }

    // Prevent duplicate test for same service
    const existing = await RadiationLeakageLevelMammography.findOne({
        serviceId,
        isDeleted: false,
    });

    if (existing) {
        return res.status(400).json({
            success: false,
            message: 'Radiation Leakage Level test already exists for this service',
        });
    }

    const newTest = await RadiationLeakageLevelMammography.create({
        serviceId,
        distanceFromFocus,
        kv,
        ma,
        time,
        workload: workload || '500',
        leakageLocations: leakageLocations || [],
        highestLeakageMR,
        highestLeakageMGy,
        finalRemark,
        toleranceArea: toleranceArea || '10',
        toleranceDimension: toleranceDimension || '20',
        toleranceDistance: toleranceDistance || '5',
        toleranceLimit: toleranceLimit || '0.02',
        toleranceTime: toleranceTime || '1',
    });

    return res.status(201).json({
        success: true,
        message: 'Radiation Leakage Level test created successfully',
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

    const test = await RadiationLeakageLevelMammography.findOne({
        serviceId,
        isDeleted: false,
    });

    if (!test) {
        return res.status(404).json({
            success: false,
            message: 'Radiation Leakage Level test not found for this service',
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

    const test = await RadiationLeakageLevelMammography.findOne({
        _id: testId,
        isDeleted: false,
    });

    if (!test) {
        return res.status(404).json({
            success: false,
            message: 'Radiation Leakage Level test not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: test,
    });
});

const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const updateData = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid testId is required',
        });
    }

    const test = await RadiationLeakageLevelMammography.findOneAndUpdate(
        { _id: testId, isDeleted: false },
        { $set: updateData },
        { new: true, runValidators: true }
    );

    if (!test) {
        return res.status(404).json({
            success: false,
            message: 'Radiation Leakage Level test not found or already deleted',
        });
    }

    return res.status(200).json({
        success: true,
        message: 'Radiation Leakage Level test updated successfully',
        data: test,
    });
});

export default {
    create,
    getById,
    update,
    getByServiceId,
};