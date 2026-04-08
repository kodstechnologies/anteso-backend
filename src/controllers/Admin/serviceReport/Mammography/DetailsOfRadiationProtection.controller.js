import mongoose from 'mongoose';
import DetailsOfRadiationProtectionMammography from '../../../../models/testTables/Mammography/DetailsOfRadiationProtectionMammography.model.js';
import ServiceReport from '../../../../models/serviceReports/serviceReport.model.js';
import Service from '../../../../models/Services.js';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

const MACHINE_TYPE = "Mammography";

const parseSurveyDate = (value) => {
    if (value === undefined || value === null) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    // Accept YYYY-MM-DD directly
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        const dt = new Date(`${raw}T00:00:00.000Z`);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    // Accept DD-MM-YYYY / DD/MM/YYYY and normalize
    const ddmmyyyy = raw.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
    if (ddmmyyyy) {
        const [, dd, mm, yyyy] = ddmmyyyy;
        const dt = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }

    // Fallback parse
    const dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? null : dt;
};

// CREATE - First time save (rejects if already exists)
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        surveyDate,
        hasValidCalibration,
        appliedCurrent,
        appliedVoltage,
        exposureTime,
        workload,
        locations,
        hospitalName,
        equipmentId,
        roomNo,
        manufacturer,
        model,
        surveyorName,
        surveyorDesignation,
        remarks,
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
        let testRecord = await DetailsOfRadiationProtectionMammography.findOne({ serviceId }).session(session);

        const testData = {
            serviceId,
            reportId: serviceReport._id,
            surveyDate: parseSurveyDate(surveyDate),
            hasValidCalibration: hasValidCalibration || null,
            appliedCurrent: appliedCurrent || null,
            appliedVoltage: appliedVoltage || null,
            exposureTime: exposureTime || null,
            workload: workload || null,
            locations: locations || [],
            hospitalName: hospitalName || null,
            equipmentId: equipmentId || null,
            roomNo: roomNo || null,
            manufacturer: manufacturer || null,
            model: model || null,
            surveyorName: surveyorName || null,
            surveyorDesignation: surveyorDesignation || null,
            remarks: remarks || null,
        };

        if (testRecord) {
            Object.assign(testRecord, testData);
            testRecord.updatedAt = Date.now();
        } else {
            testRecord = new DetailsOfRadiationProtectionMammography(testData);
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.DetailsOfRadiationProtectionMammography = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: 'Radiation Protection Survey saved successfully',
            data: testRecord,
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("DetailsOfRadiationProtection Create Error:", error);
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

    const survey = await DetailsOfRadiationProtectionMammography.findOne({
        serviceId,
    }).lean();

    if (!survey) {
        return res.status(404).json({
            success: false,
            message: 'Not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: survey,
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

    const survey = await DetailsOfRadiationProtectionMammography.findById(testId).lean();

    if (!survey) {
        return res.status(404).json({
            success: false,
            message: 'Radiation Protection Survey not found',
        });
    }

    return res.status(200).json({
        success: true,
        data: survey,
    });
});

// UPDATE - By testId
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const {
        surveyDate,
        hasValidCalibration,
        appliedCurrent,
        appliedVoltage,
        exposureTime,
        workload,
        locations,
        hospitalName,
        equipmentId,
        roomNo,
        manufacturer,
        model,
        surveyorName,
        surveyorDesignation,
        remarks,
    } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid testId is required',
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updateData = {
            updatedAt: Date.now(),
        };

        // Only set fields that are provided
        if (surveyDate !== undefined) updateData.surveyDate = parseSurveyDate(surveyDate);
        if (hasValidCalibration !== undefined) updateData.hasValidCalibration = hasValidCalibration;
        if (appliedCurrent !== undefined) updateData.appliedCurrent = appliedCurrent;
        if (appliedVoltage !== undefined) updateData.appliedVoltage = appliedVoltage;
        if (exposureTime !== undefined) updateData.exposureTime = exposureTime;
        if (workload !== undefined) updateData.workload = workload;
        if (locations !== undefined) updateData.locations = locations;
        if (hospitalName !== undefined) updateData.hospitalName = hospitalName;
        if (equipmentId !== undefined) updateData.equipmentId = equipmentId;
        if (roomNo !== undefined) updateData.roomNo = roomNo;
        if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
        if (model !== undefined) updateData.model = model;
        if (surveyorName !== undefined) updateData.surveyorName = surveyorName;
        if (surveyorDesignation !== undefined) updateData.surveyorDesignation = surveyorDesignation;
        if (remarks !== undefined) updateData.remarks = remarks;

        const updatedSurvey = await DetailsOfRadiationProtectionMammography.findByIdAndUpdate(
            testId,
            { $set: updateData },
            { new: true, runValidators: true, session }
        );

        if (!updatedSurvey) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: 'Radiation Protection Survey not found',
            });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: 'Radiation Protection Survey updated successfully',
            data: updatedSurvey,
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
