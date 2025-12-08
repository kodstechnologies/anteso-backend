import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import HighContrastResolutionForCTScan from "../../../../models/testTables/CTScan/HighContrasrResolutionForCTScan.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";

const create = asyncHandler(async (req, res) => {
    const { table1, table2, tolerance } = req.body;
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
        let testRecord = await HighContrastResolutionForCTScan.findOne({ serviceId }).session(session);

        const updateData = {
            table1: Array.isArray(table1) ? table1 : [],
            table2: Array.isArray(table2) ? table2 : [],
            tolerance: tolerance?.toString().trim() || "",
            serviceId,
            serviceReportId: serviceReport._id,
        };

        if (testRecord) {
            Object.assign(testRecord, updateData);
        } else {
            testRecord = new HighContrastResolutionForCTScan(updateData);
        }
        await testRecord.save({ session });

        // 4. Link to ServiceReport
        serviceReport.HighContrastResolutionForCTScan = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: "High Contrast Resolution saved",
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("HighContrastResolution Create Error:", error);
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
    const { table1, table2, tolerance } = req.body;
    const { testId } = req.params;

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await HighContrastResolutionForCTScan.findById(testId).session(session);
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
        if (Array.isArray(table1)) testRecord.table1 = table1;
        if (Array.isArray(table2)) testRecord.table2 = table2;
        if (tolerance !== undefined) testRecord.tolerance = tolerance?.toString().trim() || "";

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Updated successfully",
            data: { testId: testRecord._id },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("HighContrastResolution Update Error:", error);
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
        const testRecord = await HighContrastResolutionForCTScan.findById(testId)
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
        console.error("Get HighContrastResolution Error:", error);
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
        const testRecord = await HighContrastResolutionForCTScan.findOne({ serviceId }).lean().exec();

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
