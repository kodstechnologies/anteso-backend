// controllers/Admin/serviceReport/DentalConeBeamCT/RadiationProtectionSurvey.controller.js
import mongoose from "mongoose";
import RadiationProtectionSurvey from "../../../../models/testTables/DentalConeBeamCT/RadiationProtectionSurvey.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Dental Cone Beam CT";

// CREATE (with transaction)
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const {
    surveyDate,
    hasValidCalibration,
    appliedCurrent,
    appliedVoltage,
    exposureTime,
    workload,
    locations,
    hospitalName,
    equipmentId,
    roomNo,
    manufacturer,
    model,
    surveyorName,
    surveyorDesignation,
    remarks,
  } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate machine type
    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test is only allowed for ${MACHINE_TYPE}. Current: ${service.machineType}`,
      });
    }

    // Check existing - update if exists, create if not
    const existing = await RadiationProtectionSurvey.findOne({ serviceId }).session(session);

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    let testRecord;
    if (existing) {
      // Update existing
      if (surveyDate !== undefined) existing.surveyDate = new Date(surveyDate);
      if (hasValidCalibration !== undefined) existing.hasValidCalibration = hasValidCalibration;
      if (appliedCurrent !== undefined) existing.appliedCurrent = appliedCurrent;
      if (appliedVoltage !== undefined) existing.appliedVoltage = appliedVoltage;
      if (exposureTime !== undefined) existing.exposureTime = exposureTime;
      if (workload !== undefined) existing.workload = workload;
      if (locations !== undefined) existing.locations = locations;
      if (hospitalName !== undefined) existing.hospitalName = hospitalName;
      if (equipmentId !== undefined) existing.equipmentId = equipmentId;
      if (roomNo !== undefined) existing.roomNo = roomNo;
      if (manufacturer !== undefined) existing.manufacturer = manufacturer;
      if (model !== undefined) existing.model = model;
      if (surveyorName !== undefined) existing.surveyorName = surveyorName;
      if (surveyorDesignation !== undefined) existing.surveyorDesignation = surveyorDesignation;
      if (remarks !== undefined) existing.remarks = remarks;
      testRecord = existing;
    } else {
      // Create new
      testRecord = new RadiationProtectionSurvey({
        serviceId,
        reportId: serviceReport._id,
        surveyDate: surveyDate ? new Date(surveyDate) : new Date(),
        hasValidCalibration: hasValidCalibration || "",
        appliedCurrent: appliedCurrent || "",
        appliedVoltage: appliedVoltage || "",
        exposureTime: exposureTime || "",
        workload: workload || "",
        locations: locations || [],
        hospitalName: hospitalName || "",
        equipmentId: equipmentId || "",
        roomNo: roomNo || "",
        manufacturer: manufacturer || "",
        model: model || "",
        surveyorName: surveyorName || "",
        surveyorDesignation: surveyorDesignation || "",
        remarks: remarks || "",
      });
    }

    await testRecord.save({ session });

    // Link back to ServiceReport
    serviceReport.RadiationProtectionSurveyCBCT = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: existing ? "Test updated successfully" : "Test created successfully",
      data: {
        testId: testRecord._id.toString(),
        serviceId: testRecord.serviceId.toString(),
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("RadiationProtectionSurvey Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save test",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by testId (_id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const survey = await RadiationProtectionSurvey.findById(testId).lean();

  if (!survey) {
    return res.status(404).json({ message: "Radiation Protection Survey not found" });
  }

  return res.status(200).json({
    success: true,
    data: survey,
  });
});

// UPDATE with transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const {
    surveyDate,
    hasValidCalibration,
    appliedCurrent,
    appliedVoltage,
    exposureTime,
    workload,
    locations,
    hospitalName,
    equipmentId,
    roomNo,
    manufacturer,
    model,
    surveyorName,
    surveyorDesignation,
    remarks,
  } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await RadiationProtectionSurvey.findById(testId).session(session);
    if (!testRecord) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Test record not found" });
    }

    // Re-validate machine type
    const service = await Service.findById(testRecord.serviceId).session(session);
    if (service && service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
      });
    }

    // Update fields
    if (surveyDate !== undefined) testRecord.surveyDate = new Date(surveyDate);
    if (hasValidCalibration !== undefined) testRecord.hasValidCalibration = hasValidCalibration;
    if (appliedCurrent !== undefined) testRecord.appliedCurrent = appliedCurrent;
    if (appliedVoltage !== undefined) testRecord.appliedVoltage = appliedVoltage;
    if (exposureTime !== undefined) testRecord.exposureTime = exposureTime;
    if (workload !== undefined) testRecord.workload = workload;
    if (locations !== undefined) testRecord.locations = locations;
    if (hospitalName !== undefined) testRecord.hospitalName = hospitalName;
    if (equipmentId !== undefined) testRecord.equipmentId = equipmentId;
    if (roomNo !== undefined) testRecord.roomNo = roomNo;
    if (manufacturer !== undefined) testRecord.manufacturer = manufacturer;
    if (model !== undefined) testRecord.model = model;
    if (surveyorName !== undefined) testRecord.surveyorName = surveyorName;
    if (surveyorDesignation !== undefined) testRecord.surveyorDesignation = surveyorDesignation;
    if (remarks !== undefined) testRecord.remarks = remarks;

    await testRecord.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: { testId: testRecord._id.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("RadiationProtectionSurvey Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by serviceId
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  try {
    const testRecord = await RadiationProtectionSurvey.findOne({ serviceId }).lean();

    if (!testRecord) {
      return res.json({ success: true, data: null });
    }

    const service = await Service.findById(serviceId).lean();
    if (service && service.machineType !== MACHINE_TYPE) {
      return res.status(403).json({
        success: false,
        message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
      });
    }

    return res.json({ success: true, data: testRecord });
  } catch (error) {
    console.error("getByServiceId Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch test",
      error: error.message,
    });
  }
});

export default { create, getById, update, getByServiceId };

