import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import LowContrastResolutionForCTScan from "../../../../models/testTables/CTScan/LowContrastResolutionForCTScan.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";

const create = asyncHandler(async (req, res) => {
    const { acquisitionParams, result, tolerances, tubeId } = req.body;
    const { serviceId } = req.params;

    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Validate Service
        const service = await Service.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        if (service.machineType !== "Computed Tomography") {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test is only for Computed Tomography. Found: ${service.machineType}`,
            });
        }

        // 2. Get or Create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        // 3. Create or Update Test Record
        // For double tube: find by serviceId AND tubeId; for single: find by serviceId with tubeId null
        const tubeIdValue = tubeId || null;
        let testRecord = await LowContrastResolutionForCTScan.findOne({ serviceId, tubeId: tubeIdValue }).session(session);

        const updateData = {
            acquisitionParams: acquisitionParams || {},
            result: result || {},
            tolerances: Array.isArray(tolerances) ? tolerances : undefined,
            serviceId,
            reportId: serviceReport._id,
            tubeId: tubeIdValue,
        };

        if (testRecord) {
            Object.assign(testRecord, updateData);
        } else {
            testRecord = new LowContrastResolutionForCTScan(updateData);
        }
        await testRecord.save({ session });

        // 4. Link to ServiceReport
        serviceReport.lowContrastResolutionForCTScan = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Low Contrast Resolution saved",
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("LowContrastResolution Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const update = asyncHandler(async (req, res) => {
    const { acquisitionParams, result, tolerances, tubeId } = req.body;
    const { testId } = req.params;

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await LowContrastResolutionForCTScan.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // Validate machine type
        const service = await Service.findById(testRecord.serviceId).session(session);
        if (!service || service.machineType !== "Computed Tomography") {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "This test is only for Computed Tomography machines",
            });
        }

        // Update only provided fields
        if (acquisitionParams) testRecord.acquisitionParams = acquisitionParams;
        if (result) testRecord.result = result;
        if (Array.isArray(tolerances)) testRecord.tolerances = tolerances;
        if (tubeId !== undefined) testRecord.tubeId = tubeId || null;

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Updated successfully",
            data: { testId: testRecord._id },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("LowContrastResolution Update Error:", error);
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

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required" });
    }

    try {
        const testRecord = await LowContrastResolutionForCTScan.findById(testId)
            .lean()
            .exec();

        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        // Optional: validate machine type
        const service = await Service.findById(testRecord.serviceId).lean();
        if (service && service.machineType !== "Computed Tomography") {
            return res.status(403).json({
                success: false,
                message: `Test belongs to ${service.machineType}, not Computed Tomography`,
            });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("Get LowContrastResolution Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch",
            error: error.message,
        });
    }
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required" });
    }

    try {
        // Build query with optional tubeId from query parameter
        const { tubeId } = req.query;
        const query = { serviceId };
        if (tubeId !== undefined) {
            query.tubeId = tubeId === 'null' ? null : tubeId;
        }
        const testRecord = await LowContrastResolutionForCTScan.findOne(query).lean().exec();

        if (!testRecord) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        const service = await Service.findById(serviceId).lean();
        if (service && service.machineType !== "Computed Tomography") {
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
        console.error("getByServiceId Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test record",
            error: error.message,
        });
    }
});

export default { create, update, getById, getByServiceId };
