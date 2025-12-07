// controllers/Admin/serviceReport/RadiographyMobileHT/EffectiveFocalSpot.controller.js
import mongoose from "mongoose";
import EffectiveFocalSpot from "../../../../models/testTables/RadiographyMobileHT/EffectiveFocalSpot.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Radiography (Mobile) with HT";

const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { fcd, toleranceCriteria, focalSpots, finalResult } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: ${service.machineType}`,
      });
    }

    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    let testRecord = await EffectiveFocalSpot.findOne({ serviceId }).session(session);

    if (testRecord) {
      if (fcd !== undefined) testRecord.fcd = fcd;
      if (toleranceCriteria !== undefined) testRecord.toleranceCriteria = toleranceCriteria;
      if (focalSpots !== undefined) testRecord.focalSpots = focalSpots;
      if (finalResult !== undefined) testRecord.finalResult = finalResult;
    } else {
      testRecord = new EffectiveFocalSpot({
        serviceId,
        reportId: serviceReport._id,
        fcd: fcd || 0,
        toleranceCriteria: toleranceCriteria || {
          small: { multiplier: 0.5, upperLimit: 0.8 },
          medium: { multiplier: 0.4, lowerLimit: 0.8, upperLimit: 1.5 },
          large: { multiplier: 0.3, lowerLimit: 1.5 },
        },
        focalSpots: focalSpots || [],
        finalResult: finalResult || "",
      });
    }

    await testRecord.save({ session });
    serviceReport.EffectiveFocalSpotRadiographyMobileHT = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
      data: { _id: testRecord._id.toString(), serviceId: testRecord.serviceId.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("EffectiveFocalSpot Create Error:", error);
    return res.status(500).json({ success: false, message: "Failed to save test", error: error.message });
  } finally {
    if (session) session.endSession();
  }
});

const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }
  try {
    const testRecord = await EffectiveFocalSpot.findById(testId).lean();
    if (!testRecord) {
      return res.status(404).json({ success: false, message: "Test record not found" });
    }
    const service = await Service.findById(testRecord.serviceId).lean();
    if (service && service.machineType !== MACHINE_TYPE) {
      return res.status(403).json({
        success: false,
        message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
      });
    }
    return res.json({ success: true, data: testRecord });
  } catch (error) {
    console.error("getById Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch test", error: error.message });
  }
});

const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { fcd, toleranceCriteria, focalSpots, finalResult } = req.body;
  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const testRecord = await EffectiveFocalSpot.findById(testId).session(session);
    if (!testRecord) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Test record not found" });
    }
    const service = await Service.findById(testRecord.serviceId).session(session);
    if (service && service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
      });
    }
    if (fcd !== undefined) testRecord.fcd = fcd;
    if (toleranceCriteria !== undefined) testRecord.toleranceCriteria = toleranceCriteria;
    if (focalSpots !== undefined) testRecord.focalSpots = focalSpots;
    if (finalResult !== undefined) testRecord.finalResult = finalResult;
    await testRecord.save({ session });
    await session.commitTransaction();
    return res.json({ success: true, message: "Updated successfully", data: { _id: testRecord._id.toString() } });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Update Error:", error);
    return res.status(500).json({ success: false, message: "Update failed", error: error.message });
  } finally {
    if (session) session.endSession();
  }
});

const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }
  try {
    const testRecord = await EffectiveFocalSpot.findOne({ serviceId }).lean();
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
    return res.status(500).json({ success: false, message: "Failed to fetch test", error: error.message });
  }
});

export default { create, getById, update, getByServiceId };
