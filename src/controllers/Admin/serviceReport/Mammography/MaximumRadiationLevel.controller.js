import mongoose from "mongoose";
import MaximumRadiationLevelMammography from "../../../../models/testTables/Mammography/MaxRadiationLevel.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Mammography";

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { readings, maxWeeklyDose } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
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
        let testRecord = await MaximumRadiationLevelMammography.findOne({ serviceId }).session(session);

        const testData = {
            serviceId,
            reportId: serviceReport._id,
            readings: readings || [],
            maxWeeklyDose: maxWeeklyDose || "0.000",
        };

        if (testRecord) {
            Object.assign(testRecord, testData);
            testRecord.updatedAt = Date.now();
        } else {
            testRecord = new MaximumRadiationLevelMammography(testData);
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.MaximumRadiationLevelMammography = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: 'Maximum Radiation Level saved successfully',
            data: testRecord,
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("MaximumRadiationLevel Create Error:", error);
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
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    const data = await MaximumRadiationLevelMammography.findOne({ serviceId }).lean();

    if (!data) {
        return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.status(200).json({ success: true, data });
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Invalid testId" });
    }

    const data = await MaximumRadiationLevelMammography.findById(testId).lean();

    if (!data) {
        return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.status(200).json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const updateData = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    const updated = await MaximumRadiationLevelMammography.findByIdAndUpdate(
        testId,
        { $set: { ...updateData, updatedAt: Date.now() } },
        { new: true, runValidators: true }
    );

    if (!updated) {
        return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.status(200).json({ success: true, message: "Updated successfully", data: updated });
});

export default { create, getById, update, getByServiceId };