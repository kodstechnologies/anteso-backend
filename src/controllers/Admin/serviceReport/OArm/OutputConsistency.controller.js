// controllers/OutputConsistencyForOArmController.js
import OutputConsistencyForOArm from "../../../../models/testTables/OArm/OutputConsisitency.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "O-Arm";

// CREATE - With Transaction (Upsert Logic)
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        parameters,
        outputRows,
        measurementHeaders,
        tolerance,
        finalRemark,
        reportId
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid Service ID is required" });
    }

    if (!outputRows || !Array.isArray(outputRows) || outputRows.length === 0) {
        return res.status(400).json({ success: false, message: "At least one output row is required" });
    }

    // Validate kVp + mA
    for (const row of outputRows) {
        if (!row.kvp?.trim() || !row.ma?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Each row must have both kVp and mA",
            });
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Validate Service & Machine Type
        const service = await Service.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            session.endSession();
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

        // 3. Upsert Logic: Find existing testRecord or Create New
        let testRecord = await OutputConsistencyForOArm.findOne({ serviceId }).session(session);

        const testDataPayload = {
            serviceId,
            reportId: serviceReport._id,
            parameters: {
                ffd: parameters?.ffd?.toString().trim() || "100",
                time: parameters?.time?.toString().trim() || "1.0",
            },
            outputRows: outputRows.map(row => ({
                kvp: row.kvp?.toString().trim(),
                ma: row.ma?.toString().trim(),
                outputs: row.outputs?.map(o => o?.toString().trim() || "") || [],
                mean: row.mean || "",
                cov: row.cov || "",
                remark: row.remark || "",
            })),
            measurementHeaders: Array.isArray(measurementHeaders) && measurementHeaders.length > 0
                ? measurementHeaders
                : ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
            tolerance: tolerance?.toString().trim() || "0.02",
            finalRemark: finalRemark || "",
            updatedAt: Date.now(),
        };

        if (testRecord) {
            Object.assign(testRecord, testDataPayload);
        } else {
            testRecord = new OutputConsistencyForOArm(testDataPayload);
        }

        await testRecord.save({ session });

        // 4. Link test to ServiceReport (Crucial Fix)
        serviceReport.OutputConsistencyForOArm = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Output Consistency test saved successfully",
            data: testRecord,
        });

    } catch (error) {
        if (session) await session.abortTransaction();
        if (session) session.endSession();
        console.error("Save failed:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save test",
            error: error.message
        });
    }
});

// GET BY TEST ID
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Test ID",
        });
    }

    try {
        const test = await OutputConsistencyForOArm.findById(testId)
            .populate("serviceId", "machineName serialNumber manufacturer model")
            .populate("reportId", "reportNumber createdAt");

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Output Consistency test not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: test,
        });
    } catch (error) {
        console.error("getById Error:", error);
        return res.status(500).json({ success: false, message: "Error fetching test" });
    }
});

// GET BY SERVICE ID (returns null if not exists)
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Service ID",
        });
    }

    try {
        const test = await OutputConsistencyForOArm.findOne({ serviceId })
            .populate("serviceId", "machineName serialNumber manufacturer model")
            .populate("reportId", "reportNumber");

        return res.status(200).json({
            success: true,
            data: test || null,
        });
    } catch (error) {
        console.error("getByServiceId Error:", error);
        return res.status(500).json({ success: false, message: "Error fetching test" });
    }
});

// UPDATE - With Transaction (Same as Upsert logic in Create)
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const {
        parameters,
        outputRows,
        measurementHeaders,
        tolerance,
        finalRemark
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Invalid Test ID" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const testRecord = await OutputConsistencyForOArm.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        // Update fields
        testRecord.parameters = {
            ffd: parameters?.ffd?.toString().trim() || testRecord.parameters.ffd,
            time: parameters?.time?.toString().trim() || testRecord.parameters.time,
        };
        if (outputRows) {
            testRecord.outputRows = outputRows.map(row => ({
                kvp: row.kvp?.toString().trim(),
                ma: row.ma?.toString().trim(),
                outputs: row.outputs?.map(o => o?.toString().trim() || "") || [],
                mean: row.mean || "",
                cov: row.cov || "",
                remark: row.remark || "",
            }));
        }
        if (measurementHeaders) testRecord.measurementHeaders = measurementHeaders;
        if (tolerance) testRecord.tolerance = tolerance.toString().trim();
        if (finalRemark) testRecord.finalRemark = finalRemark;
        testRecord.updatedAt = Date.now();

        await testRecord.save({ session });

        // Ensure ServiceReport link exists
        let serviceReport = await ServiceReport.findOne({ serviceId: testRecord.serviceId }).session(session);
        if (serviceReport) {
            serviceReport.OutputConsistencyForOArm = testRecord._id;
            await serviceReport.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Updated successfully",
            data: testRecord,
        });

    } catch (error) {
        if (session) await session.abortTransaction();
        if (session) session.endSession();
        console.error("Update failed:", error);
        return res.status(500).json({ success: false, message: "Failed to update test" });
    }
});

export default {
    create,
    getById,
    getByServiceId,
    update,
};
