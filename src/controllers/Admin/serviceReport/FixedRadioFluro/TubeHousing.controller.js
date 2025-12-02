// controllers/TubeHousing.js
import mongoose from "mongoose";
import TubeHousingLeakage from "../../../../models/testTables/FixedRadioFluro/TubeHousing.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Radiography and Fluoroscopy";

const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        fcd,
        kv,
        ma,
        time,
        workload,
        leakageMeasurements,
        toleranceValue,
        toleranceOperator,
        toleranceTime,
        remark,
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

        // Check existing within transaction - if exists, update instead of creating
        const existing = await TubeHousingLeakage.findOne({ serviceId }).session(session);
        
        let testData;
        if (existing) {
            // Update existing record
            testData = await TubeHousingLeakage.findByIdAndUpdate(
                existing._id,
                {
                    $set: {
                        fcd: fcd || "",
                        kv: kv || "",
                        ma: ma || "",
                        time: time || "",
                        workload: workload || "",
                        leakageMeasurements: leakageMeasurements || [],
                        toleranceValue: toleranceValue || "",
                        toleranceOperator: toleranceOperator || "",
                        toleranceTime: toleranceTime || "",
                        remark: remark || "",
                        updatedAt: Date.now(),
                    },
                },
                { new: true, runValidators: true, session }
            );
            
            await serviceReport.save({ session });
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                message: "Tube Housing Leakage test updated successfully",
                data: testData,
            });
        } else {
            // Create new record
            const newTest = await TubeHousingLeakage.create(
                [{
                    serviceId,
                    reportId: serviceReport._id,
                    fcd: fcd || "",
                    kv: kv || "",
                    ma: ma || "",
                    time: time || "",
                    workload: workload || "",
                    leakageMeasurements: leakageMeasurements || [],
                    toleranceValue: toleranceValue || "",
                    toleranceOperator: toleranceOperator || "",
                    toleranceTime: toleranceTime || "",
                    remark: remark || "",
                }],
                { session }
            );

            testData = newTest[0];
        }

        // Link back to ServiceReport
        await serviceReport.save({ session });
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Tube Housing Leakage test created successfully",
            data: testData,
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

    const testData = await TubeHousingLeakage.findOne({ serviceId }).lean();

    if (!testData) {
        return res.status(404).json({ message: "No Tube Housing Leakage data found for this service" });
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

    const testData = await TubeHousingLeakage.findById(testId).lean();

    if (!testData) {
        return res.status(404).json({ message: "Tube Housing Leakage test not found" });
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
        const updatedTest = await TubeHousingLeakage.findByIdAndUpdate(
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
            return res.status(404).json({ message: "Tube Housing Leakage test not found" });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Tube Housing Leakage test updated successfully",
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


