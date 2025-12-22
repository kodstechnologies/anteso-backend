// controllers/OutputConsistencyForCArm.js
import mongoose from "mongoose";
import OutputConsistencyModel from "../../../../models/testTables/FixedRadioFluro/OutputConsistency.model.js";  // Updated model
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Radiography and Fluoroscopy";  // You can keep or change later

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        ffd,
        outputRows,
        tolerance,
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate Service & Machine Type
        const service = await Service.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Service not found" });
        }
        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: ${service.machineType}`,
            });
        }

        // Get or Create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        let testRecord = await OutputConsistencyModel.findOne({ serviceId }).session(session);

        if (testRecord) {
            if (ffd !== undefined) testRecord.ffd = ffd;
            if (outputRows !== undefined) testRecord.outputRows = outputRows;
            if (tolerance !== undefined) testRecord.tolerance = tolerance;
        } else {
            testRecord = new OutputConsistencyModel({
                serviceId,
                reportId: serviceReport._id,
                ffd: ffd || { value: "" },
                outputRows: outputRows || [],
                tolerance: tolerance || { operator: "<=", value: "" },
            });
        }

        await testRecord.save({ session });
        serviceReport.OutputConsistencyForFixedRadioFlouro = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
            data: { _id: testRecord._id.toString(), serviceId: testRecord.serviceId.toString() },
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ success: false, message: "Valid serviceId is required" });
    }

    const testData = await OutputConsistencyModel.findOne({ serviceId }).lean();

    if (!testData) {
        return res.json({ success: true, data: null });
    }

    return res.json({
        success: true,
        data: testData,
    });
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Invalid testId" });
    }

    const testData = await OutputConsistencyModel.findById(testId).lean();

    if (!testData) {
        return res.status(404).json({ message: "Output Consistency test not found" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { ffd, outputRows, tolerance } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ success: false, message: "Valid testId is required" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const testRecord = await OutputConsistencyModel.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }
        const service = await Service.findById(testRecord.serviceId).session(session);
        if (service && service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
            });
        }
        if (ffd !== undefined) testRecord.ffd = ffd;
        if (outputRows !== undefined) testRecord.outputRows = outputRows;
        if (tolerance !== undefined) testRecord.tolerance = tolerance;
        await testRecord.save({ session });
        await session.commitTransaction();
        return res.json({ success: true, message: "Updated successfully", data: { _id: testRecord._id.toString() } });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("Update Error:", error);
        return res.status(500).json({ success: false, message: "Update failed", error: error.message });
    } finally {
        if (session) session.endSession();
    }
});

export default {
    create,
    getById,
    update,
    getByServiceId,
};