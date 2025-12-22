// controllers/AccuracyOfOperatingPotentialController.js
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import AccuracyOfOperatingPotential from "../../../../models/testTables/FixedRadioFluro/accuracyOfOperatingPotential.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";

const MACHINE_TYPE = "Radiography and Fluoroscopy"; // Machine type for validation

const create = asyncHandler(async (req, res) => {
    const { table1, table2, tolerance } = req.body;
    const { serviceId } = req.params;

    // === Validation ===
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required in URL" });
    }
    if (!tolerance || !tolerance.sign || !tolerance.value) {
        return res.status(400).json({ success: false, message: "tolerance (sign & value) is required" });
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

        // 3. Upsert Test Record (create or update)
        let testRecord = await AccuracyOfOperatingPotential.findOne({ serviceId }).session(session);

        if (testRecord) {
            // Update existing
            if (table1 !== undefined) testRecord.table1 = table1;
            if (table2 !== undefined) testRecord.table2 = table2;
            if (tolerance !== undefined) testRecord.tolerance = tolerance;
        } else {
            // Create new
            testRecord = new AccuracyOfOperatingPotential({
                serviceId,
                serviceReportId: serviceReport._id,
                table1: table1 || [],
                table2: table2 || [],
                tolerance: tolerance || { value: "", type: "percent", sign: "both" },
            });
        }

        await testRecord.save({ session });

        // 4. Link back to ServiceReport
        serviceReport.accuracyOfOperatingPotentialFixedRadioFluoro = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
            data: {
                testId: testRecord._id.toString(),
                serviceId: testRecord.serviceId.toString(),
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("AccuracyOfOperatingPotential Create Error:", error);
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
    const { table1, table2, tolerance } = req.body;
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await AccuracyOfOperatingPotential.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // Re-validate machine type
        const service = await Service.findById(testRecord.serviceId).session(session);
        if (service && service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
            });
        }

        // Update fields
        if (table1 !== undefined) testRecord.table1 = table1;
        if (table2 !== undefined) testRecord.table2 = table2;
        if (tolerance !== undefined) testRecord.tolerance = tolerance;

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Updated successfully",
            data: { testId: testRecord._id.toString() },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("AccuracyOfOperatingPotential Update Error:", error);
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
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    try {
        const testRecord = await AccuracyOfOperatingPotential.findById(testId).lean();
        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        const service = await Service.findById(testRecord.serviceId).lean();
        if (service && service.machineType !== MACHINE_TYPE) {
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
            });
        }

        return res.json({ success: true, data: testRecord });
    } catch (error) {
        console.error("getById Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test",
            error: error.message,
        });
    }
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    try {
        const testRecord = await AccuracyOfOperatingPotential.findOne({ serviceId }).lean();

        if (!testRecord) {
            return res.json({ success: true, data: null });
        }

        const service = await Service.findById(serviceId).lean();
        if (service && service.machineType !== MACHINE_TYPE) {
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
            });
        }

        return res.json({ success: true, data: testRecord });
    } catch (error) {
        console.error("getByServiceId Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test",
            error: error.message,
        });
    }
});

export default { create, update, getById, getByServiceId };

