// controllers/EquipmentSetting.js
import mongoose from 'mongoose';
import EquipmentSettingForMammography from '../../../../models/testTables/Mammography/EquipmentSetting.model.js';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

// CREATE - First time save (rejects if already exists)
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        appliedCurrent,
        appliedVoltage,
        exposureTime,
        focalSpotSize,
        filtration,
        collimation,
        frameRate,
        pulseWidth,
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId is required',
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Prevent duplicate for same serviceId
        const existing = await EquipmentSettingForMammography.findOne({
            serviceId,
            isDeleted: false,
        }).session(session);

        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Equipment settings already exist for this service',
            });
        }

        const newSetting = await EquipmentSettingForMammography.create(
            [{
                serviceId,
                appliedCurrent: appliedCurrent?.trim() || null,
                appliedVoltage: appliedVoltage?.trim() || null,
                exposureTime: exposureTime?.trim() || null,
                focalSpotSize: focalSpotSize?.trim() || null,
                filtration: filtration?.trim() || null,
                collimation: collimation?.trim() || null,
                frameRate: frameRate?.trim() || null,
                pulseWidth: pulseWidth?.trim() || null,
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: 'Equipment settings created successfully',
            data: newSetting[0],
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
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId is required',
        });
    }

    const setting = await EquipmentSettingForMammography.findOne({
        serviceId,
        isDeleted: false,
    }).lean();

    if (!setting) {
        return res.status(404).json({
            success: false,
            message: 'Not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: setting,
    });
});

// GET BY TEST ID (legacy support)
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid testId',
        });
    }

    const setting = await EquipmentSettingForMammography.findOne({
        _id: testId,
        isDeleted: false,
    }).lean();

    if (!setting) {
        return res.status(404).json({
            success: false,
            message: 'Equipment setting not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: setting,
    });
});

// UPDATE - By testId
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const updateData = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid testId is required',
        });
    }

    // Prevent modifying serviceId or isDeleted
    delete updateData.serviceId;
    delete updateData.isDeleted;
    delete updateData.createdAt;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedSetting = await EquipmentSettingForMammography.findOneAndUpdate(
            { _id: testId, isDeleted: false },
            { $set: { ...updateData, updatedAt: Date.now() } },
            { new: true, runValidators: true, session }
        );

        if (!updatedSetting) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Equipment setting not found or already deleted',
            });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'Equipment settings updated successfully',
            data: updatedSetting,
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