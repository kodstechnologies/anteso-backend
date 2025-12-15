// controllers/Admin/serviceReport/BMD/TubeHousingLeakage.controller.js

import mongoose from "mongoose";
import TubeHousingLeakage from "../../../../models/testTables/BMD/TubeHousing.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Bone Densitometer (BMD)";

// CREATE (with transaction)
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const {
    measurementSettings,
    leakageMeasurements,
    workload,
    tolerance,
    calculatedResult,
  } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate machine type
    const service = await Service.findById(serviceId).session(session).lean();
    if (!service) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Service not found" });
    }
    if (service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        message: `This test is only allowed for ${MACHINE_TYPE}. Current: ${service.machineType}`,
      });
    }

    // Prevent duplicate test
    const existing = await TubeHousingLeakage.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Tube Housing Leakage test already exists for this service",
      });
    }

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Create new test
    const newTest = await TubeHousingLeakage.create(
      [
        {
          serviceId,
          reportId: serviceReport._id,
          measurementSettings: measurementSettings || { distance: "", kv: "", ma: "", time: "" },
          leakageMeasurements: leakageMeasurements || [],
          workload: workload || { value: "", unit: "mA·min/week" },
          tolerance: tolerance || { value: "1.0", operator: "less than or equal to", time: "1" },
          calculatedResult: calculatedResult || {},
        },
      ],
      { session }
    );

    // Link back to ServiceReport (Must match schema field name)
    serviceReport.TubeHousingLeakageBMD = newTest[0]._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newTest[0],
      message: "Tube Housing Leakage test created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("TubeHousingLeakage create error:", error);
    throw error;
  }
});

// GET by testId (_id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await TubeHousingLeakage.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Tube Housing Leakage test not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE with transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const {
    measurementSettings,
    leakageMeasurements,
    workload,
    tolerance,
    calculatedResult,
  } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedTest = await TubeHousingLeakage.findByIdAndUpdate(
      testId,
      {
        $set: {
          measurementSettings: measurementSettings || { distance: "", kv: "", ma: "", time: "" },
          leakageMeasurements: leakageMeasurements || [],
          workload: workload || { value: "", unit: "mA·min/week" },
          tolerance: tolerance || { value: "1.0", operator: "less than or equal to", time: "1" },
          calculatedResult: calculatedResult || {},
          updatedAt: Date.now(),
        },
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedTest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Test not found" });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      data: updatedTest,
      message: "Tube Housing Leakage test updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("TubeHousingLeakage update error:", error);
    throw error;
  }
});


const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await TubeHousingLeakage.findOne({ serviceId }).lean();

  return res.status(200).json({
    success: true,
    data: test || null,
  });
});

export default { create, getById, update, getByServiceId };