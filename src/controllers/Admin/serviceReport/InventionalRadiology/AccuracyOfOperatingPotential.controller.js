import mongoose from 'mongoose';
import Services from '../../../../models/Services.js';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';
import serviceReportModel from '../../../../models/serviceReports/serviceReport.model.js';
import AccuracyOfOperatingPotential from '../../../../models/testTables/InventionalRadiology/AccuracyOfOperatingPotential.model.js';

const create = asyncHandler(async (req, res) => {
    const { table2, maColumnLabels, toleranceValue, toleranceType, toleranceSign, tubeId } = req.body;
    const { serviceId } = req.params;

    if (!serviceId) {
        return res.status(400).json({ success: false, message: 'serviceId is required' });
    }
    if (!Array.isArray(table2)) {
        return res.status(400).json({ success: false, message: 'table2 must be an array' });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const service = await Services.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Service not found' });
        }

        let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new serviceReportModel({ serviceId });
            await serviceReport.save({ session });
        }

        const tubeIdValue = tubeId === 'null' || tubeId === '' ? null : tubeId || null;
        let testRecord = await AccuracyOfOperatingPotential.findOne({ serviceId, tubeId: tubeIdValue }).session(session);

        const tolerance = {
            value: toleranceValue?.toString().trim() || '',
            type: toleranceType || 'percent',
            sign: toleranceSign || 'both',
        };

        const payload = {
            maColumnLabels: Array.isArray(maColumnLabels) && maColumnLabels.length > 0 ? maColumnLabels : ['10', '100', '200'],
            table2,
            tolerance,
            serviceId,
            reportId: serviceReport._id,
            tubeId: tubeIdValue,
        };

        if (testRecord) {
            Object.assign(testRecord, payload);
        } else {
            testRecord = new AccuracyOfOperatingPotential(payload);
        }
        await testRecord.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: testRecord.isNew ? 'Created' : 'Updated',
            data: { _id: testRecord._id.toString(), serviceId: testRecord.serviceId.toString() },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error('AccuracyOfOperatingPotential Create Error:', error);
        return res.status(500).json({ success: false, message: 'Operation failed', error: error.message });
    } finally {
        if (session) session.endSession();
    }
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: 'Valid testId is required' });
    }
    try {
        const testRecord = await AccuracyOfOperatingPotential.findById(testId).lean().exec();
        if (!testRecord) {
            return res.status(404).json({ success: false, message: 'Test record not found' });
        }
        return res.json({ success: true, data: testRecord });
    } catch (error) {
        console.error('getById Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch', error: error.message });
    }
});

const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { table2, maColumnLabels, toleranceValue, toleranceType, toleranceSign, tubeId } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: 'Valid testId is required' });
    }
    if (table2 !== undefined && !Array.isArray(table2)) {
        return res.status(400).json({ success: false, message: 'table2 must be an array' });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await AccuracyOfOperatingPotential.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Test record not found' });
        }

        if (table2 !== undefined) testRecord.table2 = table2;
        if (Array.isArray(maColumnLabels) && maColumnLabels.length > 0) testRecord.maColumnLabels = maColumnLabels;
        if (toleranceValue !== undefined || toleranceType !== undefined || toleranceSign !== undefined) {
            testRecord.tolerance = {
                value: toleranceValue?.toString().trim() ?? testRecord.tolerance?.value ?? '',
                type: toleranceType ?? testRecord.tolerance?.type ?? 'percent',
                sign: toleranceSign ?? testRecord.tolerance?.sign ?? 'both',
            };
        }
        if (tubeId !== undefined) testRecord.tubeId = tubeId === 'null' || tubeId === '' ? null : tubeId;

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({ success: true, message: 'Updated successfully', data: { _id: testRecord._id.toString() } });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error('Update Error:', error);
        return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
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
        const { tubeId } = req.query;
        const query = { serviceId };
        if (tubeId !== undefined) {
            query.tubeId = tubeId === 'null' ? null : tubeId;
        }
        const testRecord = await AccuracyOfOperatingPotential.findOne(query).lean().exec();
        if (!testRecord) {
            return res.json({ success: true, data: null });
        }
        return res.json({ success: true, data: testRecord });
    } catch (error) {
        console.error('getByServiceId Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch', error: error.message });
    }
});

export default { create, getById, update, getByServiceId };
