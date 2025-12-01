// controllers/Admin/serviceReport/FixedRadioFluro/AccuracyOfIrradiationTime.controller.js
import mongoose from "mongoose";
import AccuracyOfIrradiationTime from "../../../../models/testTables/FixedRadioFluro/AccuracyOfIrradiationTime.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Radiography and Fluoroscopy";

// CREATE or UPDATE (Upsert) by serviceId
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { testConditions, irradiationTimes, tolerance } = req.body;

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

  const doc = await AccuracyOfIrradiationTime.findOneAndUpdate(
    { serviceId },
    {
      serviceId,
      testConditions: testConditions || { fcd: "", kv: "", ma: "" },
      irradiationTimes: irradiationTimes || [],
      tolerance: tolerance || { operator: "<=", value: "" },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({
    success: true,
    data: doc,
    message: "Accuracy of Irradiation Time (Fixed Radio Fluoro) saved successfully",
  });
});

// GET by testId (Mongo _id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await AccuracyOfIrradiationTime.findById(testId).lean();

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
  const { testConditions, irradiationTimes, tolerance } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const updatedTest = await AccuracyOfIrradiationTime.findByIdAndUpdate(
    testId,
    {
      testConditions: testConditions || { fcd: "", kv: "", ma: "" },
      irradiationTimes: irradiationTimes || [],
      tolerance: tolerance || { operator: "<=", value: "" },
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
    message: "Updated successfully",
  });
});

// GET by serviceId (convenience for frontend)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await AccuracyOfIrradiationTime.findOne({ serviceId }).lean();

  if (!test) {
    return res.status(200).json({ success: true, data: null });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

export default { create, getById, update, getByServiceId };


