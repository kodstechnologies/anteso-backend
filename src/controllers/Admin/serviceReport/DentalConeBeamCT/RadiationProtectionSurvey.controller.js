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
    const existing = await RadiationProtectionSurvey.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Radiation Protection Survey already exists for this service",
      });
    }

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Create new survey
    const newSurvey = await RadiationProtectionSurvey.create(
      [
        {
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
        },
      ],
      { session }
    );

    // Link back to ServiceReport
    serviceReport.RadiationProtectionSurvey = newSurvey[0]._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newSurvey[0],
      message: "Radiation Protection Survey (Dental Cone Beam CT) created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("RadiationProtectionSurvey create error:", error);
    throw error;
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updateData = {
      updatedAt: Date.now(),
    };

    if (surveyDate !== undefined) updateData.surveyDate = new Date(surveyDate);
    if (hasValidCalibration !== undefined) updateData.hasValidCalibration = hasValidCalibration;
    if (appliedCurrent !== undefined) updateData.appliedCurrent = appliedCurrent;
    if (appliedVoltage !== undefined) updateData.appliedVoltage = appliedVoltage;
    if (exposureTime !== undefined) updateData.exposureTime = exposureTime;
    if (workload !== undefined) updateData.workload = workload;
    if (locations !== undefined) updateData.locations = locations;
    if (hospitalName !== undefined) updateData.hospitalName = hospitalName;
    if (equipmentId !== undefined) updateData.equipmentId = equipmentId;
    if (roomNo !== undefined) updateData.roomNo = roomNo;
    if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
    if (model !== undefined) updateData.model = model;
    if (surveyorName !== undefined) updateData.surveyorName = surveyorName;
    if (surveyorDesignation !== undefined) updateData.surveyorDesignation = surveyorDesignation;
    if (remarks !== undefined) updateData.remarks = remarks;

    const updatedSurvey = await RadiationProtectionSurvey.findByIdAndUpdate(
      testId,
      { $set: updateData },
      { new: true, runValidators: true, session }
    );

    if (!updatedSurvey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Survey not found" });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      data: updatedSurvey,
      message: "Radiation Protection Survey updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("RadiationProtectionSurvey update error:", error);
    throw error;
  }
});

// GET by serviceId
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const survey = await RadiationProtectionSurvey.findOne({ serviceId }).lean();

  return res.status(200).json({
    success: true,
    data: survey || null,
  });
});

export default { create, getById, update, getByServiceId };

