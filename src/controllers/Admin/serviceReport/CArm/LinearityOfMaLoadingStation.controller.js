import mongoose from "mongoose";
import LinearityOfMaLoadingCArm from "../../../../models/testTables/CArm/LinearityOfMaLoadingStation.model.js";
import Service from "../../../../models/Services.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "C-Arm";

const normalizeTable2 = (table2 = []) =>
    table2.map((row) => ({
        ...row,
        ma: row.ma ?? row.mAsApplied ?? "",
        mAsApplied: row.mAsApplied ?? row.ma ?? "",
    }));

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { testName, table1, table2, measHeaders, tolerance, toleranceOperator } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const service = await Service.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Service not found" });
        }
        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: ${service.machineType}`,
            });
        }

        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        const doc = await LinearityOfMaLoadingCArm.findOneAndUpdate(
            { serviceId },
            {
                serviceId,
                reportId: serviceReport._id,
                testName: testName || "Linearity of mA Loading",
                table1: table1 || [],
                table2: normalizeTable2(table2),
                measHeaders: measHeaders || [],
                tolerance: tolerance ?? "0.1",
                toleranceOperator: toleranceOperator ?? "<=",
            },
            { upsert: true, new: true, setDefaultsOnInsert: true, session }
        );

        serviceReport.LinearityOfMaLoadingCArm = doc._id;
        await serviceReport.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            data: doc,
            message: "Linearity of mA Loading (C-Arm) saved successfully",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Valid testId is required" });
    }

    const test = await LinearityOfMaLoadingCArm.findById(testId).lean();

    if (!test) {
        return res.status(404).json({ message: "Test data not found" });
    }

    return res.status(200).json({
        success: true,
        data: test,
    });
});

const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const { testName, table1, table2, measHeaders, tolerance, toleranceOperator } = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Valid testId is required" });
    }

    const updated = await LinearityOfMaLoadingCArm.findByIdAndUpdate(
        testId,
        {
            ...(testName !== undefined && { testName }),
            ...(table1 !== undefined && { table1 }),
            ...(table2 !== undefined && { table2: normalizeTable2(table2) }),
            ...(measHeaders !== undefined && { measHeaders }),
            ...(tolerance !== undefined && { tolerance }),
            ...(toleranceOperator !== undefined && { toleranceOperator }),
            updatedAt: Date.now(),
        },
        { new: true, runValidators: true }
    ).lean();

    if (updated?.serviceId) {
        const serviceReport = await ServiceReport.findOne({ serviceId: updated.serviceId });
        if (
            serviceReport &&
            (!serviceReport.LinearityOfMaLoadingCArm ||
                serviceReport.LinearityOfMaLoadingCArm.toString() !== testId)
        ) {
            serviceReport.LinearityOfMaLoadingCArm = testId;
            await serviceReport.save();
        }
    }

    if (!updated) {
        return res.status(404).json({ message: "Test data not found" });
    }

    return res.status(200).json({
        success: true,
        data: updated,
        message: "Updated successfully",
    });
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const test = await LinearityOfMaLoadingCArm.findOne({ serviceId }).lean();

    if (!test) {
        return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({
        success: true,
        data: test,
    });
});

export default { create, getById, update, getByServiceId };
