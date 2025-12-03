// controllers/Admin/serviceReport/DentalConeBeamCT/RadiationLeakagelevel.controller.js
import mongoose from "mongoose";
import RadiationLeakagelevel from "../../../../models/testTables/DentalConeBeamCT/RadiationLeakagelevel.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Dental Cone Beam CT";

// CREATE (with transaction)
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const {
    settings,
    leakageMeasurements,
    workload,
    workloadUnit,
    maxLeakageResult,
    maxRadiationLeakage,
    toleranceValue,
    toleranceOperator,
    toleranceTime,
    notes,
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
    const existing = await RadiationLeakagelevel.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Radiation Leakage Level test already exists for this service",
      });
    }

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Create new test
    const newTest = await RadiationLeakagelevel.create(
      [
        {
          serviceId,
          reportId: serviceReport._id,
          settings: settings || [],
          leakageMeasurements: leakageMeasurements || [],
          workload: workload || "",
          workloadUnit: workloadUnit || "mA·min/week",
          maxLeakageResult: maxLeakageResult || "",
          maxRadiationLeakage: maxRadiationLeakage || "",
          toleranceValue: toleranceValue || "",
          toleranceOperator: toleranceOperator || "less than or equal to",
          toleranceTime: toleranceTime || "1",
          notes: notes || "",
        },
      ],
      { session }
    );

    // Link back to ServiceReport
    serviceReport.RadiationLeakagelevel = newTest[0]._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newTest[0],
      message: "Radiation Leakage Level (Dental Cone Beam CT) created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("RadiationLeakagelevel create error:", error);
    throw error;
  }
});

// GET by testId (_id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await RadiationLeakagelevel.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Test data not found" });
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
    settings,
    leakageMeasurements,
    workload,
    workloadUnit,
    maxLeakageResult,
    maxRadiationLeakage,
    toleranceValue,
    toleranceOperator,
    toleranceTime,
    notes,
  } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedTest = await RadiationLeakagelevel.findByIdAndUpdate(
      testId,
      {
        $set: {
          settings: settings !== undefined ? settings : [],
          leakageMeasurements: leakageMeasurements !== undefined ? leakageMeasurements : [],
          workload: workload !== undefined ? workload : "",
          workloadUnit: workloadUnit !== undefined ? workloadUnit : "mA·min/week",
          maxLeakageResult: maxLeakageResult !== undefined ? maxLeakageResult : "",
          maxRadiationLeakage: maxRadiationLeakage !== undefined ? maxRadiationLeakage : "",
          toleranceValue: toleranceValue !== undefined ? toleranceValue : "",
          toleranceOperator: toleranceOperator !== undefined ? toleranceOperator : "less than or equal to",
          toleranceTime: toleranceTime !== undefined ? toleranceTime : "1",
          notes: notes !== undefined ? notes : "",
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
      message: "Radiation Leakage Level updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("RadiationLeakagelevel update error:", error);
    throw error;
  }
});

// GET by serviceId
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await RadiationLeakagelevel.findOne({ serviceId }).lean();

  return res.status(200).json({
    success: true,
    data: test || null,
  });
});

export default { create, getById, update, getByServiceId };

