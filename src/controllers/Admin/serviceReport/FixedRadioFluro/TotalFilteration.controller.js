// controllers/TotalFilteration.js
import mongoose from "mongoose";
import TotalFilterationForFixedRadioFluoro from "../../../../models/testTables/FixedRadioFluro/TotalFilteration.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Radiography and Fluoroscopy";

// CREATE - With Transaction
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        mAStations,
        measurements,
        tolerance,
        totalFiltration,
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
        const existing = await TotalFilterationForFixedRadioFluoro.findOne({ serviceId }).session(session);
        
        let testData;
        if (existing) {
            // Update existing record
            testData = await TotalFilterationForFixedRadioFluoro.findByIdAndUpdate(
                existing._id,
                {
                    $set: {
                        mAStations: mAStations || [],
                        measurements: measurements || [],
                        tolerance: tolerance || { sign: "", value: "" },
                        totalFiltration: totalFiltration || { measured: "", required: "" },
                        updatedAt: Date.now(),
                    },
                },
                { new: true, runValidators: true, session }
            );
            
            // Ensure serviceReport is saved
            await serviceReport.save({ session });
            
            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                message: "Total Filtration test updated successfully",
                data: testData,
            });
        } else {
            // Create new record
            const newTest = await TotalFilterationForFixedRadioFluoro.create(
                [{
                    serviceId,
                    reportId: serviceReport._id,
                    mAStations: mAStations || [],
                    measurements: measurements || [],
                    tolerance: tolerance || { sign: "", value: "" },
                    totalFiltration: totalFiltration || { measured: "", required: "" },
                }],
                { session }
            );

            testData = newTest[0];
        }

        // Note: TotalFilterationForFixedRadioFluoro field may need to be added to ServiceReport model
        // For now, we'll save the test without linking to ServiceReport
        await serviceReport.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Total Filtration test created successfully",
            data: testData,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
});

// GET BY SERVICE ID
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const testData = await TotalFilterationForFixedRadioFluoro.findOne({ serviceId }).lean();

    if (!testData) {
        return res.status(404).json({ message: "No Total Filtration data found for this service" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

// GET BY TEST ID
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Invalid testId" });
    }

    const testData = await TotalFilterationForFixedRadioFluoro.findById(testId).lean();

    if (!testData) {
        return res.status(404).json({ message: "Total Filtration test not found" });
    }

    return res.status(200).json({
        success: true,
        data: testData,
    });
});

// UPDATE - With Transaction
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const updateData = req.body;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Valid testId is required" });
    }

    // Prevent changing serviceId
    delete updateData.serviceId;
    delete updateData.createdAt;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedTest = await TotalFilterationForFixedRadioFluoro.findByIdAndUpdate(
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
            return res.status(404).json({ message: "Total Filtration test not found" });
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Total Filtration test updated successfully",
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

