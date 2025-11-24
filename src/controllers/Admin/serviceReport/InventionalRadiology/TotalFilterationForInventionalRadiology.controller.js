// controllers/Admin/serviceReport/InventionalRadiology/TotalFilterationForInventionalRadiology.controller.js
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import TotalFilterationForInventionalRadiology from "../../../../models/testTables/InventionalRadiology/TotalFilterationForInventionalRadiology.model.js";
import ServiceReport from "../../../../models/testTables/InventionalRadiology/TotalFilterationForInventionalRadiology.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";

const MACHINE_TYPE = "Cath Lab/Interventional Radiology";

const create = asyncHandler(async (req, res) => {
    const { mAStations, measurements, tolerance, totalFiltration } = req.body;
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Validate Service + Machine Type
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

        // 3. Save Test Data (Upsert)
        let testRecord = await TotalFilterationForInventionalRadiology.findOne({ serviceId }).session(session);

        if (testRecord) {
            // Update existing
            testRecord.mAStations = mAStations ?? testRecord.mAStations;
            testRecord.measurements = measurements ?? testRecord.measurements;
            testRecord.tolerance = tolerance ?? testRecord.tolerance;
            testRecord.totalFiltration = totalFiltration ?? testRecord.totalFiltration;
            testRecord.updatedAt = Date.now();
        } else {
            // Create new
            testRecord = new TotalFilterationForInventionalRadiology({
                serviceId,
                mAStations,
                measurements,
                tolerance,
                totalFiltration,
                reportId: serviceReport._id,
            });
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.TotalFilterationForInventionalRadiology = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Total Filtration test saved and linked successfully",
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("TotalFilteration Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save test",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const update = asyncHandler(async (req, res) => {
    const { mAStations, measurements, tolerance, totalFiltration } = req.body;
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Find test record
        const testRecord = await TotalFilterationForInventionalRadiology.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // 2. Validate machine type via serviceId
        const service = await Service.findById(testRecord.serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Associated service not found" });
        }

        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test can only be updated for ${MACHINE_TYPE}. Found: ${service.machineType}`,
            });
        }

        // 3. Update fields (only if provided)
        if (mAStations !== undefined) testRecord.mAStations = mAStations;
        if (measurements !== undefined) testRecord.measurements = measurements;
        if (tolerance !== undefined) testRecord.tolerance = tolerance;
        if (totalFiltration !== undefined) testRecord.totalFiltration = totalFiltration;
        testRecord.updatedAt = Date.now();

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Total Filtration test updated successfully",
            data: {
                testId: testRecord._id,
                serviceId: testRecord.serviceId,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("TotalFilteration Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required in URL" });
    }

    try {
        const testRecord = await TotalFilterationForInventionalRadiology.findById(testId)
            .lean()
            .exec();

        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // Optional: Validate machine type
        const service = await Service.findById(testRecord.serviceId).lean();
        if (service && service.machineType !== MACHINE_TYPE) {
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
            });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("Get TotalFilteration Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test record",
            error: error.message,
        });
    }
});

export default { create, update, getById };