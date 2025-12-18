// controllers/Admin/serviceReport/CTScan/TablePosition.controller.js
import mongoose from "mongoose";
import TablePosition from "../../../../models/testTables/CTScan/TablePosition.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Computed Tomography";

// CREATE or UPDATE with Transaction
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { initialTablePosition, loadOnCouch, exposureParameters, tableIncrementation, toleranceSign, toleranceValue } = req.body;

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
    const existing = await TablePosition.findOne({ serviceId }).session(session);

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    let testRecord;
    if (existing) {
      // Update existing
      if (initialTablePosition !== undefined) existing.initialTablePosition = initialTablePosition;
      if (loadOnCouch !== undefined) existing.loadOnCouch = loadOnCouch;
      if (exposureParameters !== undefined) existing.exposureParameters = exposureParameters;
      if (tableIncrementation !== undefined) existing.tableIncrementation = tableIncrementation;
      if (toleranceSign !== undefined) existing.toleranceSign = toleranceSign;
      if (toleranceValue !== undefined) existing.toleranceValue = toleranceValue;
      testRecord = existing;
    } else {
      // Create new
      testRecord = new TablePosition({
        serviceId,
        serviceReportId: serviceReport._id,
        initialTablePosition: initialTablePosition || '',
        loadOnCouch: loadOnCouch || '',
        exposureParameters: exposureParameters || [],
        tableIncrementation: tableIncrementation || [],
        toleranceSign: toleranceSign || '±',
        toleranceValue: toleranceValue || '2',
      });
    }

    await testRecord.save({ session });

    // Link back to ServiceReport
    serviceReport.TablePositionCTScan = testRecord._id;
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
    console.error("TablePosition Create Error:", error);
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
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await TablePosition.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE by testId
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { initialTablePosition, loadOnCouch, exposureParameters, tableIncrementation, toleranceSign, toleranceValue } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await TablePosition.findById(testId).session(session);
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
    if (initialTablePosition !== undefined) testRecord.initialTablePosition = initialTablePosition;
    if (loadOnCouch !== undefined) testRecord.loadOnCouch = loadOnCouch;
    if (exposureParameters !== undefined) testRecord.exposureParameters = exposureParameters;
    if (tableIncrementation !== undefined) testRecord.tableIncrementation = tableIncrementation;
    if (toleranceSign !== undefined) testRecord.toleranceSign = toleranceSign;
    if (toleranceValue !== undefined) testRecord.toleranceValue = toleranceValue;

    await testRecord.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: { testId: testRecord._id.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("TablePosition Update Error:", error);
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
    const testRecord = await TablePosition.findOne({ serviceId }).lean();

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

