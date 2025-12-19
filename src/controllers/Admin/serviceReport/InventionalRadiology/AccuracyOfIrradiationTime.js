// controllers/Admin/serviceReport/InventionalRadiology/AccuracyOfIrradiationTime.js
import mongoose from "mongoose";
import AccuracyOfIrradiationTime from "../../../../models/testTables/InventionalRadiology/accuracyOfIrradiationTime.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Interventional Radiology";

// CREATE or UPDATE (Upsert) by serviceId with transaction
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { testConditions, irradiationTimes, tolerance } = req.body;

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
    // For double tube: find by serviceId AND tubeId; for single: find by serviceId with tubeId null
    const { tubeId } = req.body;
    const tubeIdValue = tubeId || null;
    let testRecord = await AccuracyOfIrradiationTime.findOne({ serviceId, tubeId: tubeIdValue }).session(session);

    if (testRecord) {
      // Update existing
      if (testConditions !== undefined) testRecord.testConditions = testConditions;
      if (irradiationTimes !== undefined) testRecord.irradiationTimes = irradiationTimes;
      if (tolerance !== undefined) testRecord.tolerance = tolerance;
    } else {
      // Create new
      testRecord = new AccuracyOfIrradiationTime({
        serviceId,
        tubeId: tubeIdValue,
        testConditions: testConditions || { fcd: "", kv: "", ma: "" },
        irradiationTimes: irradiationTimes || [],
        tolerance: tolerance || { operator: "<=", value: "" },
      });
    }

    await testRecord.save({ session });

    // Link back to ServiceReport
    serviceReport.AccuracyOfIrradiationTimeInventionalRadiology = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
      data: {
        _id: testRecord._id.toString(),
        testId: testRecord._id.toString(),
        serviceId: testRecord.serviceId.toString(),
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("AccuracyOfIrradiationTime Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save test",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by testId (Mongo _id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const test = await AccuracyOfIrradiationTime.findById(testId);

  if (!test) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE by testId (Mongo _id) with transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { testConditions, irradiationTimes, tolerance, tubeId } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await AccuracyOfIrradiationTime.findById(testId).session(session);
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
    if (irradiationTimes !== undefined) testRecord.irradiationTimes = irradiationTimes;
    if (tolerance !== undefined) testRecord.tolerance = tolerance;
    if (tubeId !== undefined) testRecord.tubeId = tubeId || null;

    await testRecord.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: { testId: testRecord._id.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("AccuracyOfIrradiationTime Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by serviceId (convenience for frontend)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  try {
    // Build query with optional tubeId from query parameter
    const { tubeId } = req.query;
    const query = { serviceId };
    if (tubeId !== undefined) {
      query.tubeId = tubeId === 'null' ? null : tubeId;
    }
    const testRecord = await AccuracyOfIrradiationTime.findOne(query).lean();

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