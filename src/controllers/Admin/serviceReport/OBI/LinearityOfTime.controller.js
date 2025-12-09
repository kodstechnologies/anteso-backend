// controllers/Admin/serviceReport/OBI/LinearityOfTime.controller.js
import mongoose from "mongoose";
import LinearityOfTime from "../../../../models/testTables/OBI/LinearityOfTime.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "On-Board Imaging (OBI)";

// CREATE or UPDATE (Upsert) by serviceId with transaction
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { testConditions, measurementRows, tolerance, xMax, xMin, coefficientOfLinearity, remarks } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Validate Service & Machine Type
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

    // Get or Create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Upsert Test Record (create or update)
    let testRecord = await LinearityOfTime.findOne({ serviceId }).session(session);

    if (testRecord) {
      // Update existing
      if (testConditions !== undefined) testRecord.testConditions = testConditions;
      if (measurementRows !== undefined) testRecord.measurementRows = measurementRows;
      if (tolerance !== undefined) testRecord.tolerance = tolerance;
      if (xMax !== undefined) testRecord.xMax = xMax;
      if (xMin !== undefined) testRecord.xMin = xMin;
      if (coefficientOfLinearity !== undefined) testRecord.coefficientOfLinearity = coefficientOfLinearity;
      if (remarks !== undefined) testRecord.remarks = remarks;
    } else {
      // Create new
      testRecord = new LinearityOfTime({
        serviceId,
        serviceReportId: serviceReport._id,
        testConditions: testConditions || { fdd: "", kv: "", time: "" },
        measurementRows: measurementRows || [],
        tolerance: tolerance || "0.1",
        xMax: xMax || "",
        xMin: xMin || "",
        coefficientOfLinearity: coefficientOfLinearity || "",
        remarks: remarks || "",
      });
    }

    await testRecord.save({ session });

    // Link back to ServiceReport
    serviceReport.LinearityOfTimeOBI = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
      data: {
        testId: testRecord._id.toString(),
        serviceId: testRecord.serviceId.toString(),
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("LinearityOfTime Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save test",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by testId
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }

  try {
    const testRecord = await LinearityOfTime.findById(testId).lean();
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
    return res.status(500).json({
      success: false,
      message: "Failed to fetch test",
      error: error.message,
    });
  }
});

// UPDATE by testId
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { testConditions, measurementRows, tolerance, xMax, xMin, coefficientOfLinearity, remarks } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await LinearityOfTime.findById(testId).session(session);
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
    if (testConditions !== undefined) testRecord.testConditions = testConditions;
    if (measurementRows !== undefined) testRecord.measurementRows = measurementRows;
    if (tolerance !== undefined) testRecord.tolerance = tolerance;
    if (xMax !== undefined) testRecord.xMax = xMax;
    if (xMin !== undefined) testRecord.xMin = xMin;
    if (coefficientOfLinearity !== undefined) testRecord.coefficientOfLinearity = coefficientOfLinearity;
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
    console.error("LinearityOfTime Update Error:", error);
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
    const testRecord = await LinearityOfTime.findOne({ serviceId }).lean();

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
