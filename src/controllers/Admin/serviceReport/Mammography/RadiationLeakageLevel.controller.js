import RadiationLeakageLevelMammography from '../../../../models/testTables/Mammography/RadiationLeakageLevel.model.js';
import ServiceReport from '../../../../models/serviceReports/serviceReport.model.js';
import Service from '../../../../models/Services.js';
import mongoose from 'mongoose';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

const MACHINE_TYPE = "Mammography";

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { fcd, kv, ma, time, workload, leakageMeasurements, toleranceValue, toleranceOperator, toleranceTime, remark } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Valid serviceId is required in URL params',
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
        let testRecord = await RadiationLeakageLevelMammography.findOne({ serviceId }).session(session);

        if (testRecord) {
            testRecord.fcd = fcd || testRecord.fcd;
            testRecord.kv = kv || testRecord.kv;
            testRecord.ma = ma || testRecord.ma;
            testRecord.time = time || testRecord.time;
            testRecord.workload = workload || testRecord.workload;
            testRecord.leakageMeasurements = leakageMeasurements || testRecord.leakageMeasurements;
            testRecord.toleranceValue = toleranceValue || testRecord.toleranceValue;
            testRecord.toleranceOperator = toleranceOperator || testRecord.toleranceOperator;
            testRecord.toleranceTime = toleranceTime || testRecord.toleranceTime;
            testRecord.remark = remark || testRecord.remark;
        } else {
            testRecord = new RadiationLeakageLevelMammography({
                serviceId,
                reportId: serviceReport._id,
                fcd: fcd || '',
                kv: kv || '',
                ma: ma || '',
                time: time || '',
                workload: workload || '',
                leakageMeasurements: leakageMeasurements || [],
                toleranceValue: toleranceValue || '',
                toleranceOperator: toleranceOperator || 'less than or equal to',
                toleranceTime: toleranceTime || '1',
                remark: remark || '',
            });
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.RadiationLeakageLevelMammography = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: 'Radiation Leakage Level test saved successfully',
            data: testRecord,
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("RadiationLeakageLevel Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save test",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
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