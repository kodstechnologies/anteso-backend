import { asyncHandler } from '../../../../utils/AsyncHandler.js';
import ImagingPhantomMammography from '../../../../models/testTables/Mammography/ImagingPhantom.model.js';
import ServiceReport from '../../../../models/serviceReports/serviceReport.model.js';
import Service from '../../../../models/Services.js';
import mongoose from 'mongoose';

const MACHINE_TYPE = "Mammography";

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
        const overallRemark = rowsWithRemarks.every(row => row.remark === 'Pass') ? 'Pass' : 'Fail';

        // 3. Upsert Test Record
        let testRecord = await ImagingPhantomMammography.findOne({ serviceId }).session(session);

        if (testRecord) {
            testRecord.rows = rowsWithRemarks;
            testRecord.remark = overallRemark;
            testRecord.updatedAt = Date.now();
        } else {
            testRecord = new ImagingPhantomMammography({
                serviceId,
                reportId: serviceReport._id,
                rows: rowsWithRemarks,
                remark: overallRemark,
            });
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.ImagingPhantomMammography = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: 'Imaging Phantom test saved successfully',
            data: testRecord,
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("ImagingPhantom Create Error:", error);
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