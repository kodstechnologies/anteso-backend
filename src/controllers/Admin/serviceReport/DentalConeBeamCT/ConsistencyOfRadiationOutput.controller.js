// controllers/Admin/serviceReport/DentalConeBeamCT/ConsistencyOfRadiationOutput.controller.js
import mongoose from "mongoose";
import OutputConsistencyForCBCT from "../../../../models/testTables/DentalConeBeamCT/ConsistencyOfRadiationOutput.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Dental Cone Beam CT";

// CREATE (with transaction)
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { ffd, outputRows, measurementHeaders, tolerance, finalRemark } = req.body;

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
    const existing = await OutputConsistencyForCBCT.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Consistency of Radiation Output test already exists for this service",
      });
    }

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Create new test document
    const newTest = await OutputConsistencyForCBCT.create(
      [
        {
          serviceId,
          reportId: serviceReport._id,
          ffd: ffd || "",
          outputRows: outputRows || [],
          measurementHeaders: measurementHeaders || ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
          tolerance: tolerance || "",
          finalRemark: finalRemark || "",
        },
      ],
      { session }
    );

    // Link back to ServiceReport
    serviceReport.ConsistencyOfRadiationOutput = newTest[0]._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newTest[0],
      message: "Consistency of Radiation Output test created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("ConsistencyOfRadiationOutput create error:", error);
    throw error;
  }
});

// GET by testId (_id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await OutputConsistencyForCBCT.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Consistency of Radiation Output test not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE with transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { ffd, outputRows, measurementHeaders, tolerance, finalRemark } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedTest = await OutputConsistencyForCBCT.findByIdAndUpdate(
      testId,
      {
        $set: {
          ffd: ffd !== undefined ? ffd : "",
          outputRows: outputRows !== undefined ? outputRows : [],
          measurementHeaders: measurementHeaders !== undefined ? measurementHeaders : ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
          tolerance: tolerance !== undefined ? tolerance : "",
          finalRemark: finalRemark !== undefined ? finalRemark : "",
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
      message: "Consistency of Radiation Output test updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("ConsistencyOfRadiationOutput update error:", error);
    throw error;
  }
});

// GET by serviceId (frontend convenience)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await OutputConsistencyForCBCT.findOne({ serviceId }).lean();

  return res.status(200).json({
    success: true,
    data: test || null,
  });
});

export default { create, getById, update, getByServiceId };

