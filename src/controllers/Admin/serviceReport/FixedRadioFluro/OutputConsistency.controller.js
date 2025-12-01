// controllers/OutputConsistency.js
import mongoose from "mongoose";
import OutputConsistencyForFixedRadioFluoro from "../../../../models/testTables/FixedRadioFluro/OutputConsistency.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Radiography and Fluoroscopy";

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        parameters,
        outputRows,
        measurementHeaders,
        tolerance,
        finalRemark,
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

        // Check existing
        const existing = await OutputConsistencyForFixedRadioFluoro.findOne({ serviceId }).session(session);
        if (existing) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Output Consistency data already exists for this service" });
        }

        // Get or Create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        const newTest = await OutputConsistencyForFixedRadioFluoro.create(
            [{
                serviceId,
                reportId: serviceReport._id,
                parameters: parameters || { mas: "", sliceThickness: "", time: "" },
                outputRows: outputRows || [],
                measurementHeaders: measurementHeaders || ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
                tolerance: tolerance || "",
                finalRemark: finalRemark || "",
            }],
            { session }
        );

        // Link back to ServiceReport
        serviceReport.OutputConsistencyForFixedRadioFluoro = newTest[0]._id;
        await serviceReport.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Output Consistency test created successfully",
            data: newTest[0],
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
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const testData = await OutputConsistencyForFixedRadioFluoro.findOne({ serviceId }).lean();

    if (!testData) {
        return res.status(404).json({ message: "No Output Consistency data found for this service" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Invalid testId" });
    }

    const testData = await OutputConsistencyForFixedRadioFluoro.findById(testId).lean();

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
    const updateData = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Valid testId is required" });
    }

    delete updateData.serviceId;
    delete updateData.createdAt;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedTest = await OutputConsistencyForFixedRadioFluoro.findByIdAndUpdate(
            testId,
            {
                $set: {
                    ...updateData,
                    updatedAt: Date.now(),
                },
            },
            { new: true, runValidators: true, session }
        );

        if (!updatedTest) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Output Consistency test not found" });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Output Consistency test updated successfully",
            data: updatedTest,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

export default {
    create,
    getById,
    update,
    getByServiceId,
};

