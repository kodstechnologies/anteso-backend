// controllers/Admin/serviceReport/DentalHandHeld/LinearityOfMaLoading.controller.js
import mongoose from "mongoose";
import LinearityOfMaLoading from "../../../../models/testTables/DentalHandHeld/LinearityOfmALoading.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Dental (Hand-held)";

// CREATE or UPDATE (Upsert) by serviceId
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { table1, table2, tolerance } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

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

        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        let testRecord = await LinearityOfMaLoading.findOne({ serviceId }).session(session);

        if (testRecord) {
            if (table1 !== undefined) testRecord.table1 = table1;
            if (table2 !== undefined) testRecord.table2 = table2;
            if (tolerance !== undefined) testRecord.tolerance = tolerance;
        } else {
            testRecord = new LinearityOfMaLoading({
                serviceId,
                serviceReportId: serviceReport._id,
                table1: table1 || { fcd: "", kv: "", time: "" },
                table2: table2 || [],
                tolerance: tolerance || "0.1",
            });
        }

        await testRecord.save({ session });

        serviceReport.LinearityOfMaLoadingDentalHandHeld = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
            data: {
                _id: testRecord._id.toString(),
                testId: testRecord._id.toString(),
                serviceId: testRecord.serviceId.toString(),
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("LinearityOfMaLoading Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save test",
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
    const testRecord = await LinearityOfMaLoading.findById(testId).lean();
    if (!testRecord) return res.status(404).json({ success: false, message: "Test record not found" });
    return res.json({ success: true, data: testRecord });
});

const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { table1, table2, tolerance } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    const testRecord = await LinearityOfMaLoading.findByIdAndUpdate(
        testId,
        { table1, table2, tolerance },
        { new: true, runValidators: true }
    );

    if (!testRecord) return res.status(404).json({ success: false, message: "Test record not found" });

    return res.json({ success: true, message: "Updated successfully", data: testRecord });
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }
    const testRecord = await LinearityOfMaLoading.findOne({ serviceId }).lean();
    return res.json({ success: true, data: testRecord || null });
});

export default { create, getById, update, getByServiceId };
