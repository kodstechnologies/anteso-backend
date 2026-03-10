import mongoose from 'mongoose';
import EquipmentSettingForMammography from '../../../../models/testTables/Mammography/EquipmentSetting.model.js';
import ServiceReport from '../../../../models/serviceReports/serviceReport.model.js';
import Service from '../../../../models/Services.js';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

const MACHINE_TYPE = "Mammography";

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

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

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

        // 3. Upsert Test Record
        let testRecord = await EquipmentSettingForMammography.findOne({
            serviceId,
            isDeleted: false,
        }).session(session);

        const testData = {
            serviceId,
            reportId: serviceReport._id,
            appliedCurrent: appliedCurrent?.trim() || null,
            appliedVoltage: appliedVoltage?.trim() || null,
            exposureTime: exposureTime?.trim() || null,
            focalSpotSize: focalSpotSize?.trim() || null,
            filtration: filtration?.trim() || null,
            collimation: collimation?.trim() || null,
            frameRate: frameRate?.trim() || null,
            pulseWidth: pulseWidth?.trim() || null,
        };

        if (testRecord) {
            Object.assign(testRecord, testData);
            testRecord.updatedAt = Date.now();
        } else {
            testRecord = new EquipmentSettingForMammography(testData);
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.EquipmentSettingMammography = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: 'Equipment settings saved successfully',
            data: testRecord,
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("EquipmentSetting Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save test",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
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