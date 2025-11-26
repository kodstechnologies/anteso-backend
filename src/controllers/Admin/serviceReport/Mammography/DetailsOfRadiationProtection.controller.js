// controllers/RadiationProtectionSurvey.js
import mongoose from 'mongoose';
import DetailsOfRadiationProtectionMammography from '../../../../models/testTables/Mammography/DetailsOfRadiationProtectionMammography.model.js';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

// CREATE - First time save (rejects if already exists)
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { surveyDate, hasValidCalibration } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId is required',
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Check for existing record
        const existing = await DetailsOfRadiationProtectionMammography.findOne({
            serviceId,
        }).session(session);

        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Radiation Protection Survey already exists for this service',
            });
        }

        const newSurvey = await DetailsOfRadiationProtectionMammography.create(
            [{
                serviceId,
                surveyDate: surveyDate ? new Date(surveyDate) : null,
                hasValidCalibration: hasValidCalibration || null,
            }],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: 'Radiation Protection Survey created successfully',
            data: newSurvey[0],
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
    const { surveyDate, hasValidCalibration } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid testId is required',
        });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedSurvey = await DetailsOfRadiationProtectionMammography.findByIdAndUpdate(
            testId,
            {
                $set: {
                    surveyDate: surveyDate ? new Date(surveyDate) : null,
                    hasValidCalibration: hasValidCalibration || null,
                    updatedAt: Date.now(),
                },
            },
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