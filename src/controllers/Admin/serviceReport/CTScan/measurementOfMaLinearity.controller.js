import mongoose from "mongoose";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import Services from "../../../../models/Services.js";
import serviceReportModel from "../../../../models/serviceReports/serviceReport.model.js";
import MeasurementOfMaLinearity from "../../../../models/testTables/CTScan/measurementOfMaLinearity.model.js";


const create = asyncHandler(async (req, res) => {
  const { table1, table2, tolerance } = req.body;
  const { serviceId } = req.params;

  // === Validate Input ===
  if (!serviceId) {
    return res.status(400).json({ success: false, message: "serviceId is required" });
  }
  if (!Array.isArray(table1) || !Array.isArray(table2)) {
    return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Validate Service + CT Scan
    const service = await Services.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (service.machineType !== "CT Scan") {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test is only for CT Scan. Found: ${service.machineType}`,
      });
    }

    // 2. Get or Create ServiceReport (Manual)
    let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new serviceReportModel({ serviceId });
      await serviceReport.save({ session });
    }

    // 3. Save Test Data
    let testRecord = await MeasurementOfMaLinearity.findOne({ serviceId }).session(session);

    const payload = {
      table1,
      table2,
      tolerance: tolerance?.toString().trim() || "0.1",
      serviceId,
      serviceReportId: serviceReport._id,
    };

    if (testRecord) {
      Object.assign(testRecord, payload);
    } else {
      testRecord = new MeasurementOfMaLinearity(payload);
    }
    await testRecord.save({ session });

    // 4. Link to ServiceReport
    serviceReport.MeasurementOfMaLinearity = testRecord._id; // ← Field name in your model
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? "Created" : "Updated",
      data: {
        testId: testRecord._id,
        serviceReportId: serviceReport._id,
      },
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error("Abort failed:", abortError);
      }
    }
    console.error("MeasurementOfMaLinearity Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Operation failed",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// ====================== GET BY TEST ID ======================
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId) {
    return res.status(400).json({ success: false, message: "testId is required" });
  }

  try {
    const testRecord = await MeasurementOfMaLinearity.findById(testId).lean().exec();
    if (!testRecord) {
      return res.status(404).json({ success: false, message: "Test record not found" });
    }

    return res.json({
      success: true,
      data: testRecord,
    });
  } catch (error) {
    console.error("GetById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch",
      error: error.message,
    });
  }
});

// ====================== UPDATE BY TEST ID ======================
const update = asyncHandler(async (req, res) => {
  const { table1, table2, tolerance } = req.body;
  const { testId } = req.params;

  if (!testId) {
    return res.status(400).json({ success: false, message: "testId is required" });
  }
  if (!Array.isArray(table1) || !Array.isArray(table2)) {
    return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await MeasurementOfMaLinearity.findById(testId).session(session);
    if (!testRecord) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Test record not found" });
    }

    // Validate CT Scan
    const service = await Services.findById(testRecord.serviceId).session(session);
    if (!service || service.machineType !== "CT Scan") {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: "This test can only be updated for CT Scan",
      });
    }

    // Update
    testRecord.table1 = table1;
    testRecord.table2 = table2;
    testRecord.tolerance = tolerance?.toString().trim() || "0.1";
    await testRecord.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: { testId: testRecord._id },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

export default { create, getById, update };