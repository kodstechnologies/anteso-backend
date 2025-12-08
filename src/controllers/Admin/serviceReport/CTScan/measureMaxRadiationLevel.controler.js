// controllers/Admin/serviceReport/CTScan/measureMaxRadiationLevel.controller.js
import mongoose from 'mongoose';
import MeasureMaxRadiationLevel from '../../../../models/testTables/CTScan/MeasureMaxRadiationLevel.model.js';
import serviceReportModel from '../../../../models/serviceReports/serviceReport.model.js';
import Services from '../../../../models/Services.js';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

/**
 * @desc Create/Update MeasureMaxRadiationLevel + Link to ServiceReport
 * @route POST /api/measure-max-radiation-level/:serviceId
 * @access Private
 */
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { readings, maxWorkerMRPerWeek, maxPublicMRPerWeek } = req.body;

    // === Validate Input ===
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId in URL params is required',
        });
    }

    if (!Array.isArray(readings) || readings.length !== 10) {
        return res.status(400).json({
            success: false,
            message: 'Exactly 10 readings are required in the request body',
        });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Validate Service + Machine Type
        const service = await Services.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        if (service.machineType !== 'Computed Tomography') {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test is only for Computed Tomography. Found: ${service.machineType}`,
            });
        }

        // 2. Get or Create ServiceReport
        let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new serviceReportModel({ serviceId });
            await serviceReport.save({ session });
        }

        // 3. Save Test Data (Upsert)
        let testRecord = await MeasureMaxRadiationLevel.findOne({ serviceId }).session(session);

        const payload = {
            serviceId,
            readings,
            maxWorkerMRPerWeek: maxWorkerMRPerWeek?.toString().trim(),
            maxPublicMRPerWeek: maxPublicMRPerWeek?.toString().trim(),
            reportId: serviceReport._id,
        };

        if (testRecord) {
            Object.assign(testRecord, payload);
        } else {
            testRecord = new MeasureMaxRadiationLevel(payload);
        }

        await testRecord.save({ session });

        // 4. Link Test to ServiceReport
        serviceReport.MeasureMaxRadiationLevel = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.status(testRecord.isNew ? 201 : 200).json({
            success: true,
            message: testRecord.isNew ? 'Created' : 'Updated',
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error('MeasureMaxRadiationLevel Create Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Operation failed',
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

/**
 * @desc Get test by testId (_id)
 * @route GET /api/measure-max-radiation-level/test/:testId
 * @access Private
 */
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: 'Valid testId is required' });
    }

    try {
        const testRecord = await MeasureMaxRadiationLevel.findById(testId).lean().exec();
        if (!testRecord) {
            return res.status(404).json({ success: false, message: 'Test record not found' });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error('GetById Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch',
            error: error.message,
        });
    }
});

/**
 * @desc Update test by testId
 * @route PUT /api/measure-max-radiation-level/test/:testId
 * @access Private
 */
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { readings, maxWorkerMRPerWeek, maxPublicMRPerWeek } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: 'Valid testId is required' });
    }

    if (readings !== undefined && (!Array.isArray(readings) || readings.length !== 10)) {
        return res.status(400).json({ success: false, message: 'Exactly 10 readings are required' });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await MeasureMaxRadiationLevel.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Test record not found' });
        }

        // Validate machine type
        const service = await Services.findById(testRecord.serviceId).session(session);
        if (!service || service.machineType !== 'Computed Tomography') {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: 'This test can only be updated for Computed Tomography',
            });
        }

        // Update fields
        if (readings !== undefined) testRecord.readings = readings;
        if (maxWorkerMRPerWeek !== undefined) testRecord.maxWorkerMRPerWeek = maxWorkerMRPerWeek?.toString().trim();
        if (maxPublicMRPerWeek !== undefined) testRecord.maxPublicMRPerWeek = maxPublicMRPerWeek?.toString().trim();

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: 'Updated successfully',
            data: { testId: testRecord._id },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error('Update Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Update failed',
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: 'Valid serviceId is required' });
    }

    try {
        const testRecord = await MeasureMaxRadiationLevel.findOne({ serviceId }).lean().exec();

        if (!testRecord) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        const service = await Services.findById(serviceId).lean();
        if (service && service.machineType !== 'Computed Tomography') {
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not Computed Tomography`,
            });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error('getByServiceId Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch test record',
            error: error.message,
        });
    }
});

export default { create, getById, update, getByServiceId };