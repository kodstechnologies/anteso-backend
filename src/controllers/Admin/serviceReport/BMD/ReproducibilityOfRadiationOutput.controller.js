// controllers/Admin/serviceReport/BMD/ReproducibilityOfOutput.controller.js

import mongoose from "mongoose";
import ReproducibilityOfOutput from "../../../../models/testTables/BMD/ConsistencyOfRadiationOutput.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Bone Densitometer (BMD)";

// CREATE (with transaction)
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { fcd, outputRows, tolerance } = req.body;

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
    const existing = await ReproducibilityOfOutput.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Reproducibility of Output test already exists for this service",
      });
    }

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Create new test document
    const newTest = await ReproducibilityOfOutput.create(
      [
        {
          serviceId,
          reportId: serviceReport._id,
          fcd: fcd || { value: "" },
          outputRows: outputRows || [],
          tolerance: tolerance || { operator: "<=", value: "" },
        },
      ],
      { session }
    );

    // Link back to ServiceReport (Must match schema field name)
    serviceReport.ReproducibilityOfRadiationOutputBMD = newTest[0]._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newTest[0],
      message: "Reproducibility of Output test created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("ReproducibilityOfOutput create error:", error);
    throw error;
  }
});

// GET by testId (_id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await ReproducibilityOfOutput.findById(testId)
    .lean()
    .select("-isDeleted");

  if (!test) {
    return res.status(404).json({ message: "Reproducibility of Output test not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE with transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { fcd, outputRows, tolerance } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedTest = await ReproducibilityOfOutput.findByIdAndUpdate(
      testId,
      {
        $set: {
          fcd: fcd || { value: "" },
          outputRows: outputRows || [],
          tolerance: tolerance || { operator: "<=", value: "" },
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
      message: "Reproducibility of Output test updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("ReproducibilityOfOutput update error:", error);
    throw error;
  }
});

// GET by serviceId (frontend convenience)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await ReproducibilityOfOutput.findOne({ serviceId })
    .lean()
    .select("-isDeleted");

  return res.status(200).json({
    success: true,
    data: test || null, // Returns null if not found
  });
});

export default { create, getById, update, getByServiceId };