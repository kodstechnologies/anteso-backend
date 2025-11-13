

// ======================
// CREATE / UPDATE (POST)

import mongoose from "mongoose";
import Services from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import TimerAccuracy from "../../../../models/testTables/CTScan/TimerAccuracy.model.js";
import serviceReportModel from "../../../../models/serviceReports/serviceReport.model.js";

// ======================
// const create = asyncHandler(async (req, res) => {
//   const { table1, table2, tolerance } = req.body;
//   const { serviceId } = req.params;

//   // === Validate ===
//   if (!serviceId) {
//     return res.status(400).json({ success: false, message: "serviceId is required" });
//   }
//   if (!Array.isArray(table1) || !Array.isArray(table2)) {
//     return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
//   }

//   let session = null;
//   try {
//     session = await mongoose.startSession();
//     session.startTransaction();

//     // 1. Validate Service + CT Scan
//     const service = await Service.findById(serviceId).session(session);
//     if (!service) {
//       await session.abortTransaction();
//       return res.status(404).json({ success: false, message: "Service not found" });
//     }
//     if (service.machineType !== "CT Scan") {
//       await session.abortTransaction();
//       return res.status(403).json({
//         success: false,
//         message: `This test is only for CT Scan. Found: ${service.machineType}`,
//       });
//     }

//     // 2. Get or Create ServiceReport (Manual + Safe)
//     let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);

//     if (!serviceReport) {
//       serviceReport = new ServiceReport({ serviceId });
//       await serviceReport.save({ session });
//     }

//     // 3. Save TimerAccuracy Test
//     let testRecord = await TimerAccuracy.findOne({ serviceId }).session(session);

//     const payload = {
//       table1,
//       table2,
//       tolerance: tolerance?.toString().trim() || "",
//       serviceId,
//       serviceReportId: serviceReport._id,
//     };

//     if (testRecord) {
//       Object.assign(testRecord, payload);
//     } else {
//       testRecord = new TimerAccuracy(payload);
//     }
//     await testRecord.save({ session });

//     // 4. Link to ServiceReport
//     serviceReport.timerAccuracy = testRecord._id;
//     await serviceReport.save({ session });

//     await session.commitTransaction();

//     return res.json({
//       success: true,
//       message: testRecord.isNew ? "Created" : "Updated",
//       data: {
//         testId: testRecord._id,
//         serviceReportId: serviceReport._id,
//       },
//     });
//   } catch (error) {
//     if (session) {
//       try {
//         await session.abortTransaction();
//       } catch (abortError) {
//         console.error("Abort failed:", abortError);
//       }
//     }
//     console.error("TimerAccuracy Create Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Operation failed",
//       error: error.message,
//     });
//   } finally {
//     if (session) session.endSession();
//   }
// });


// ====================== CREATE ======================
const create = asyncHandler(async (req, res) => {
  const { table1, table2, tolerance } = req.body;
  const { serviceId } = req.params;

  if (!serviceId) return res.status(400).json({ success: false, message: "serviceId required" });
  if (!Array.isArray(table1) || !Array.isArray(table2)) {
    return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const service = await Services.findById(serviceId).session(session);
    if (!service || service.machineType !== "CT Scan") {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: "CT Scan only" });
    }

    let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new serviceReportModel({ serviceId });
      await serviceReport.save({ session });
    }

    let testRecord = await TimerAccuracy.findOne({ serviceId }).session(session);
    const payload = { table1, table2, tolerance: tolerance?.toString() || "", serviceId, serviceReportId: serviceReport._id };

    if (testRecord) {
      Object.assign(testRecord, payload);
    } else {
      testRecord = new TimerAccuracy(payload);
    }
    await testRecord.save({ session });

    serviceReport.TimerAccuracy = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? "Created" : "Updated",
      data: { testId: testRecord._id, serviceReportId: serviceReport._id },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    return res.status(500).json({ success: false, message: "Failed", error: error.message });
  } finally {
    if (session) session.endSession();
  }
});




// ======================
// GET BY TEST ID
// ======================
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId) {
    return res.status(400).json({ success: false, message: "testId is required" });
  }

  try {
    const testRecord = await TimerAccuracy.findById(testId).lean().exec();
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

// ======================
// UPDATE BY TEST ID
// ======================
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

    const testRecord = await TimerAccuracy.findById(testId).session(session);
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
    testRecord.tolerance = tolerance?.toString().trim() || "";
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