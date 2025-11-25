// controllers/linearityOfMasLLoadingController.js
import mongoose from "mongoose";
import LinearityOfMasLLoadingMammography from "../../../../models/testTables/Mammography/LinearityOfMasLoading.model.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import serviceReportModel from "../../../../models/serviceReports/serviceReport.model.js";
import Services from "../../../../models/Services.js";


const MACHINE_TYPE = "Mammography"; // Change if needed: "Fluoroscopy", "C-Arm", etc.

// CREATE new linearity test
// CREATE or UPDATE (Upsert) – simple & clean
const create = asyncHandler(async (req, res) => {
    const {
        exposureCondition,
        measurementHeaders,
        measurements,
        tolerance
    } = req.body;
    const { serviceId } = req.params;

    // Minimal validation
    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // Get or create ServiceReport
        let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new serviceReportModel({ serviceId });
            await serviceReport.save({ session });
        }

        // Find existing test
        let testRecord = await LinearityOfMasLLoadingMammography.findOne({ serviceId }).session(session);

        if (testRecord) {
            // Update existing
            testRecord.exposureCondition = {
                fcd: exposureCondition?.fcd || testRecord.exposureCondition.fcd,
                kv: exposureCondition?.kv || testRecord.exposureCondition.kv,
            };
            testRecord.measurementHeaders = measurementHeaders || testRecord.measurementHeaders;
            testRecord.measurements = measurements || testRecord.measurements;
            testRecord.tolerance = tolerance || testRecord.tolerance;
        } else {
            // Create new
            testRecord = new LinearityOfMasLLoadingMammography({
                serviceId,
                reportId: serviceReport._id,
                exposureCondition: {
                    fcd: exposureCondition?.fcd || "100",
                    kv: exposureCondition?.kv || "80",
                },
                measurementHeaders: measurementHeaders || ["Meas 1", "Meas 2", "Meas 3"],
                measurements: measurements || [],
                tolerance: tolerance || "0.1",
            });
        }

        await testRecord.save({ session });

        // Link to ServiceReport
        serviceReport.LinearityOfMasLLoading = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Saved successfully",
            data: {
                testId: testRecord._id.toString(),
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("Linearity Save Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

// GET by MongoDB _id
const update = asyncHandler(async (req, res) => {
    const {
        exposureCondition,
        measurementHeaders,
        measurements,
        tolerance
    } = req.body;
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await LinearityOfMasLLoadingMammography.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        const service = await Services.findById(testRecord.serviceId).session(session);
        if (service && service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
            });
        }

        testRecord.exposureCondition = exposureCondition || testRecord.exposureCondition;
        testRecord.measurementHeaders = measurementHeaders || testRecord.measurementHeaders;
        testRecord.measurements = (measurements || []).map(m => ({
            mAsRange: m.mAsRange?.trim() || "",
            measuredOutputs: m.measuredOutputs || [],
            xMax: m.xMax || "",
            xMin: m.xMin || "",
            col: m.col || "",
            remarks: m.remarks || "",
        }));
        testRecord.tolerance = tolerance || testRecord.tolerance;

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Updated successfully",
            data: { testId: testRecord._id.toString() },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("LinearityOfMasLLoading Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

// GET by testId
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    try {
        const testRecord = await LinearityOfMasLLoadingMammography.findById(testId).lean();
        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        const service = await Services.findById(testRecord.serviceId).lean();
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

// GET by serviceId — returns null if not exists (perfect for frontend)
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    try {
        const testRecord = await LinearityOfMasLLoadingMammography.findOne({ serviceId }).lean();

        if (!testRecord) {
            return res.json({ success: true, data: null }); // First time → no data
        }

        const service = await Services.findById(serviceId).lean();
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
export default {
    create,
    getById,
    update,
    getByServiceId,
};