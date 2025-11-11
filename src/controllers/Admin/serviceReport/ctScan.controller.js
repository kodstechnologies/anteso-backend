// controllers/radiationProfileWidthForCTScan.controller.js
import { asyncHandler } from "../../../utils/AsyncHandler.js";
import RadiationProfileWidthForCTScan from "../../../models/testTables/CTScan/RadiationProfileWidth.model.ForCTScan.js";
import ServiceReport from "../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../models/Services.js";
import mongoose from "mongoose";

const createRadiationProfileWidth = asyncHandler(async (req, res) => {
    const { table1, table2 } = req.body;
    const { serviceId } = req.params; // Get from URL params

    // === Validate ===
    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required in URL" });
    }
    if (!Array.isArray(table1) || !Array.isArray(table2)) {
        return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
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

        // === CHECK MACHINE TYPE ===
        if (service.machineType !== "CT Scan") {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test is only allowed for CT Scan. Current machine: ${service.machineType}`,
            });
        }

        // 2. Get or Create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        // 3. Save Test Data
        let testRecord = await RadiationProfileWidthForCTScan.findOne({ serviceId }).session(session);

        if (testRecord) {
            testRecord.table1 = table1;
            testRecord.table2 = table2;
        } else {
            testRecord = new RadiationProfileWidthForCTScan({
                table1,
                table2,
                serviceId,
                serviceReportId: serviceReport._id,
            });
        }
        await testRecord.save({ session });

        // 4. Link back
        serviceReport.RadiationProfileWidthForCTScan = testRecord._id;
        await serviceReport.save({ session });

        // Commit
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Saved and linked successfully",
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("RadiationProfileWidth Save Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const updateRadiationProfileWidth = asyncHandler(async (req, res) => {
    const { table1, table2 } = req.body;
    const { serviceId } = req.params;

    if (!serviceId) return res.status(400).json({ success: false, message: "serviceId required" });
    if (!Array.isArray(table1) || !Array.isArray(table2)) {
        return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await RadiationProfileWidthForCTScan.findOne({ serviceId }).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Record not found" });
        }

        testRecord.table1 = table1;
        testRecord.table2 = table2;
        await testRecord.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Updated successfully",
            data: { testId: testRecord._id },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        return res.status(500).json({ success: false, message: "Update failed", error: error.message });
    } finally {
        if (session) session.endSession();
    }
});

const getById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "testId is required in URL" });
    }

    try {
        const testRecord = await RadiationProfileWidthForCTScan.findById(id)
            .lean()
            .exec();

        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // Optional: Validate machine type via serviceId
        const service = await Service.findById(testRecord.serviceId).lean();
        if (service && service.machineType !== "CT Scan") {
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not CT Scan`,
            });
        }
        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("GetByTestId Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test record",
            error: error.message,
        });
    }
});

export default { createRadiationProfileWidth, updateRadiationProfileWidth, getById, updateRadiationProfileWidth };