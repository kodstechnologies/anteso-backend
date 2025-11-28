// controllers/TubeHousing.controller.js
import RadiationLeakageLevelForCTScan from "../../../../models/testTables/CArm/TubeHousingLeakage.model.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const {
    measurementSettings,
    leakageMeasurements,
    workload,
    workloadUnit = "mA·min/week",
    tolerance,
    toleranceOperator = "less than or equal to",
    toleranceTime = "1",
    maxLeakagePerHour,
    finalResult = "",
    reportId,
  } = req.body;

  // Validation
  if (!measurementSettings || !leakageMeasurements || !workload || !tolerance) {
    return res.status(400).json({
      success: false,
      message: "measurementSettings, leakageMeasurements, workload, and tolerance are required",
    });
  }

  if (!measurementSettings.kv || !measurementSettings.ma || !measurementSettings.time || !measurementSettings.fcd) {
    return res.status(400).json({
      success: false,
      message: "All measurement settings (kV, mA, time, FCD) are required",
    });
  }

  if (!Array.isArray(leakageMeasurements) || leakageMeasurements.length === 0) {
    return res.status(400).json({
      success: false,
      message: "At least one leakage measurement is required",
    });
  }

  // Prevent duplicate for same service
  const existing = await RadiationLeakageLevelForCTScan.findOne({ serviceId });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "Tube housing leakage test already exists for this service",
    });
  }

  const newTest = await RadiationLeakageLevelForCTScan.create({
    serviceId,
    reportId: reportId || null,
    measurementSettings,
    leakageMeasurements,
    workload,
    workloadUnit,
    tolerance,
    toleranceOperator,
    toleranceTime,
    maxLeakagePerHour: maxLeakagePerHour || null,
    finalResult: finalResult || "",
  });

  return res.status(201).json({
    success: true,
    message: "Tube housing leakage test created successfully",
    data: newTest,
  });
});

// GET by testId (_id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const test = await RadiationLeakageLevelForCTScan.findById(testId);

  if (!test) {
    return res.status(404).json({
      success: false,
      message: "Tube housing leakage test not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// GET by serviceId (returns existing test or null)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  const test = await RadiationLeakageLevelForCTScan.findOne({ serviceId });

  return res.status(200).json({
    success: true,
    data: test || null, // Important: frontend expects null if not created
  });
});

// UPDATE existing test
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const updateData = req.body;

  const test = await RadiationLeakageLevelForCTScan.findById(testId);

  if (!test) {
    return res.status(404).json({
      success: false,
      message: "Tube housing leakage test not found",
    });
  }

  // Prevent changing serviceId
  if (updateData.serviceId) {
    delete updateData.serviceId;
  }

  const updatedTest = await RadiationLeakageLevelForCTScan.findByIdAndUpdate(
    testId,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    success: true,
    message: "Tube housing leakage test updated successfully",
    data: updatedTest,
  });
});

export default {
  create,
  getById,
  getByServiceId,
  update,
};