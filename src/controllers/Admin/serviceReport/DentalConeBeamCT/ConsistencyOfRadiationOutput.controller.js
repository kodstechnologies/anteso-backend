// controllers/Admin/serviceReport/DentalConeBeamCT/ConsistencyOfRadiationOutput.controller.js
import mongoose from "mongoose";
import OutputConsistencyForCBCT from "../../../../models/testTables/DentalConeBeamCT/ConsistencyOfRadiationOutput.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Dental Cone Beam CT";

// CREATE (with transaction)
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { ffd, outputRows, measurementHeaders, tolerance, finalRemark } = req.body;

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
    const existing = await OutputConsistencyForCBCT.findOne({ serviceId }).session(session);

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    let testRecord;
    if (existing) {
      // Update existing
      existing.ffd = ffd !== undefined ? ffd : existing.ffd;
      existing.outputRows = outputRows !== undefined ? outputRows : existing.outputRows;
      existing.measurementHeaders = measurementHeaders !== undefined ? measurementHeaders : existing.measurementHeaders;
      existing.tolerance = tolerance !== undefined ? tolerance : existing.tolerance;
      existing.finalRemark = finalRemark !== undefined ? finalRemark : existing.finalRemark;
      testRecord = existing;
    } else {
      // Create new
      testRecord = new OutputConsistencyForCBCT({
        serviceId,
        reportId: serviceReport._id,
        ffd: ffd || "",
        outputRows: outputRows || [],
        measurementHeaders: measurementHeaders || ["Meas 1", "Meas 2", "Meas 3", "Meas 4", "Meas 5"],
        tolerance: tolerance || "",
        finalRemark: finalRemark || "",
      });
    }

    await testRecord.save({ session });

    // Link back to ServiceReport
    serviceReport.OutputConsistencyForCBCT = testRecord._id;
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
    console.error("ConsistencyOfRadiationOutput Create Error:", error);
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

  const test = await OutputConsistencyForCBCT.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Consistency of Radiation Output test not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE with transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { ffd, outputRows, measurementHeaders, tolerance, finalRemark } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await OutputConsistencyForCBCT.findById(testId).session(session);
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
    if (ffd !== undefined) testRecord.ffd = ffd;
    if (outputRows !== undefined) testRecord.outputRows = outputRows;
    if (measurementHeaders !== undefined) testRecord.measurementHeaders = measurementHeaders;
    if (tolerance !== undefined) testRecord.tolerance = tolerance;
    if (finalRemark !== undefined) testRecord.finalRemark = finalRemark;

    await testRecord.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: { testId: testRecord._id.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("ConsistencyOfRadiationOutput Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by serviceId (frontend convenience)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  try {
    const testRecord = await OutputConsistencyForCBCT.findOne({ serviceId }).lean();

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

