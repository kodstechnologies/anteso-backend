// controllers/Admin/serviceReport/DentalConeBeamCT/AccuracyOfOperatingPotential.controller.js
import mongoose from "mongoose";
import AccuracyOfOperatingPotential from "../../../../models/testTables/DentalConeBeamCT/AccuracyOfOperatingPotential.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Dental Cone Beam CT";

// CREATE or UPDATE (Upsert) by serviceId
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { mAStations, measurements, tolerance, totalFiltration } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  // Validate machine type
  const service = await Service.findById(serviceId).lean();
  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }
  if (service.machineType !== MACHINE_TYPE) {
    return res.status(403).json({
      message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: ${service.machineType}`,
    });
  }

  const doc = await AccuracyOfOperatingPotential.findOneAndUpdate(
    { serviceId },
    {
      serviceId,
      mAStations: mAStations || [],
      measurements: measurements || [],
      tolerance: tolerance || { sign: "±", value: "" },
      totalFiltration: totalFiltration || { measured: "", required: "" },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({
    success: true,
    data: doc,
    message: "Accuracy of Operating Potential (Dental Cone Beam CT) saved successfully",
  });
});

// GET by testId (Mongo _id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await AccuracyOfOperatingPotential.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE by testId (Mongo _id)
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { mAStations, measurements, tolerance, totalFiltration } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const updatedTest = await AccuracyOfOperatingPotential.findByIdAndUpdate(
    testId,
    {
      mAStations: mAStations || [],
      measurements: measurements || [],
      tolerance: tolerance || { sign: "±", value: "" },
      totalFiltration: totalFiltration || { measured: "", required: "" },
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedTest) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: updatedTest,
    message: "Accuracy of Operating Potential updated successfully",
  });
});

// GET by serviceId (convenience for frontend)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await AccuracyOfOperatingPotential.findOne({ serviceId }).lean();

  return res.status(200).json({
    success: true,
    data: test || null,
  });
});

export default { create, getById, update, getByServiceId };

