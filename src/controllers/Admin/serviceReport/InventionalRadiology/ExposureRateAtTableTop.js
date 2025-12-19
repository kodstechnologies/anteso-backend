// controllers/testTables/ExposureRateAtTableTop.controller.js
import mongoose from "mongoose";
import ExposureRateTableTop from "../../../../models/testTables/InventionalRadiology/exposureRate.model.js";
import Services from "../../../../models/Services.js";
import serviceReportModel from "../../../../models/serviceReports/serviceReport.model.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const create = asyncHandler(async (req, res) => {
    const { rows, nonAecTolerance, aecTolerance, minFocusDistance } = req.body;
    const { serviceId } = req.params;

    // Validation
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }
    if (!Array.isArray(rows)) {
        return res.status(400).json({ success: false, message: "rows must be an array" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Validate Service exists
        const service = await Services.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        // 2. Get or create ServiceReport
        let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new serviceReportModel({ serviceId });
            await serviceReport.save({ session });
        }

        // 3. Check if test already exists
        // For double tube: find by serviceId AND tubeId; for single: find by serviceId with tubeId null
        const { tubeId } = req.body;
        const tubeIdValue = tubeId || null;
        let testRecord = await ExposureRateTableTop.findOne({ serviceId, tubeId: tubeIdValue }).session(session);

        const payload = {
            serviceId,
            tubeId: tubeIdValue,
            reportId: serviceReport._id,
            rows: rows.map(row => ({
                distance: row.distance?.trim() || "",
                appliedKv: row.appliedKv?.trim() || "",
                appliedMa: row.appliedMa?.trim() || "",
                exposure: row.exposure?.trim() || "",
                remark: row.remark?.trim() || "",
            })),
            nonAecTolerance: nonAecTolerance?.trim() || "",
            aecTolerance: aecTolerance?.trim() || "",
            minFocusDistance: minFocusDistance?.trim() || "",
        };

        if (testRecord) {
            // Update existing
            Object.assign(testRecord, payload);
        } else {
            // Create new
            testRecord = new ExposureRateTableTop(payload);
        }

        await testRecord.save({ session });

        // 4. Link to ServiceReport (assuming you have this field)
        serviceReport.exposureRateTableTop = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: testRecord.isNew ? "Created successfully" : "Updated successfully",
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("ExposureRateTableTop Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Operation failed",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

// ====================== GET BY TEST ID ======================
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    try {
        const testRecord = await ExposureRateTableTop.findById(testId).lean();
        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("GetById Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test data",
            error: error.message,
        });
    }
});

// ====================== UPDATE BY TEST ID ======================
const update = asyncHandler(async (req, res) => {
    const { rows, nonAecTolerance, aecTolerance, minFocusDistance, tubeId } = req.body;
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }
    if (!Array.isArray(rows)) {
        return res.status(400).json({ success: false, message: "rows must be an array" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await ExposureRateTableTop.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // Optional: Re-validate service (optional but safe)
        const service = await Services.findById(testRecord.serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Associated service not found" });
        }

        // Update fields
        testRecord.rows = rows.map(row => ({
            distance: row.distance?.trim() || "",
            appliedKv: row.appliedKv?.trim() || "",
            appliedMa: row.appliedMa?.trim() || "",
            exposure: row.exposure?.trim() || "",
            remark: row.remark?.trim() || "",
        }));

        testRecord.nonAecTolerance = nonAecTolerance?.trim() || "";
        testRecord.aecTolerance = aecTolerance?.trim() || "";
        testRecord.minFocusDistance = minFocusDistance?.trim() || "";
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
        console.error("ExposureRateTableTop Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

// ====================== GET BY SERVICE ID ======================
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { tubeId } = req.query;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    try {
        // Build query with optional tubeId from query parameter
        const query = { serviceId };
        if (tubeId !== undefined) {
            query.tubeId = tubeId === 'null' ? null : tubeId;
        }
        
        const testRecord = await ExposureRateTableTop.findOne(query).lean();

        if (!testRecord) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("GetByServiceId Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test record",
            error: error.message,
        });
    }
});

export default { create, getById, update, getByServiceId };