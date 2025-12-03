// controllers/Admin/serviceReport/DentalConeBeamCT/LinearityOfmALoading.controller.js
import mongoose from "mongoose";
import LinearityOfmALoading from "../../../../models/testTables/DentalConeBeamCT/LinearityOfmALoading.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Dental Cone Beam CT";

// CREATE or UPDATE with Transaction
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { table1, table2, tolerance } = req.body;

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
    const existing = await LinearityOfmALoading.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Linearity of mA Loading test already exists for this service",
      });
    }

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Create the test document
    const newTest = await LinearityOfmALoading.create(
      [
        {
          serviceId,
          serviceReportId: serviceReport._id,
          table1: table1 || { fcd: "", kv: "", time: "" },
          table2: table2 || [],
          tolerance: tolerance || "0.1",
        },
      ],
      { session }
    );

    // Link back to ServiceReport
    serviceReport.LinearityOfmALoading = newTest[0]._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newTest[0],
      message: "Linearity of mA Loading (Dental Cone Beam CT) created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("LinearityOfmALoading create error:", error);
    throw error;
  }
});

// GET by testId
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await LinearityOfmALoading.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE by testId
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { table1, table2, tolerance } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedTest = await LinearityOfmALoading.findByIdAndUpdate(
      testId,
      {
        $set: {
          table1: table1 || { fcd: "", kv: "", time: "" },
          table2: table2 || [],
          tolerance: tolerance || "0.1",
          updatedAt: Date.now(),
        },
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedTest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Test data not found" });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      data: updatedTest,
      message: "Linearity of mA Loading updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("LinearityOfmALoading update error:", error);
    throw error;
  }
});

// GET by serviceId
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await LinearityOfmALoading.findOne({ serviceId }).lean();

  return res.status(200).json({
    success: true,
    data: test || null,
  });
});

export default { create, getById, update, getByServiceId };

