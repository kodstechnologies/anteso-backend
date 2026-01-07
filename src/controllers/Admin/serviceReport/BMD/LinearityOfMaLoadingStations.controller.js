// controllers/Admin/serviceReport/BMD/LinearityOfMaLoading.controller.js

import mongoose from "mongoose";
import LinearityOfMaLoading from "../../../../models/testTables/BMD/LinearityOfMasLoading.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js"; // Add this
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Bone Densitometer (BMD)";

// CREATE or UPDATE with Transaction
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { table1, table2, tolerance } = req.body;

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
    const existing = await LinearityOfMaLoading.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Linearity of mA Loading test already exists for this service",
      });
    }

    // Get or create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Normalize table1 - ensure it's an object, not an array
    let normalizedTable1 = table1;
    if (Array.isArray(table1) && table1.length > 0) {
      normalizedTable1 = table1[0];
    } else if (!table1 || typeof table1 !== 'object') {
      normalizedTable1 = { fcd: "", kv: "", time: "" };
    }

    // Normalize table2 - ensure each row has required 'ma' field
    let normalizedTable2 = table2 || [];
    if (Array.isArray(normalizedTable2)) {
      normalizedTable2 = normalizedTable2.map(row => ({
        ma: row.ma || row.mAsApplied || '', // Support both field names
        measuredOutputs: row.measuredOutputs || [],
        average: row.average || '',
        x: row.x || '',
        xMax: row.xMax || '',
        xMin: row.xMin || '',
        col: row.col || '',
        remarks: row.remarks || '',
      }));
    }

    // Create the test document
    const newTest = await LinearityOfMaLoading.create(
      [
        {
          serviceId,
          serviceReportId: serviceReport._id,
          table1: normalizedTable1,
          table2: normalizedTable2,
          tolerance: tolerance || "0.1",
        },
      ],
      { session }
    );

    // Link back to ServiceReport (Must match schema field name)
    serviceReport.LinearityOfMaLoadingBMD = newTest[0]._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: newTest[0],
      message: "Linearity of mA Loading (BMD) created successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("LinearityOfMaLoading create error:", error);
    throw error;
  }
});

// GET by testId
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const test = await LinearityOfMaLoading.findById(testId).lean();

  if (!test) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE with Transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { table1, table2, tolerance } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Valid testId is required" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Normalize table1 - ensure it's an object, not an array
    let normalizedTable1 = table1;
    if (Array.isArray(table1) && table1.length > 0) {
      normalizedTable1 = table1[0];
    } else if (!table1 || typeof table1 !== 'object') {
      normalizedTable1 = { fcd: "", kv: "", time: "" };
    }

    // Normalize table2 - ensure each row has required 'ma' field
    let normalizedTable2 = table2 || [];
    if (Array.isArray(normalizedTable2)) {
      normalizedTable2 = normalizedTable2.map(row => ({
        ma: row.ma || row.mAsApplied || '', // Support both field names
        measuredOutputs: row.measuredOutputs || [],
        average: row.average || '',
        x: row.x || '',
        xMax: row.xMax || '',
        xMin: row.xMin || '',
        col: row.col || '',
        remarks: row.remarks || '',
      }));
    }

    const updatedTest = await LinearityOfMaLoading.findByIdAndUpdate(
      testId,
      {
        $set: {
          table1: normalizedTable1,
          table2: normalizedTable2,
          tolerance: tolerance || "0.1",
          updatedAt: Date.now(),
        },
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedTest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Test not found" });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      data: updatedTest,
      message: "Linearity of mA Loading updated successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("LinearityOfMaLoading update error:", error);
    throw error;
  }
});

// GET by serviceId (frontend convenience)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ message: "Valid serviceId is required" });
  }

  const test = await LinearityOfMaLoading.findOne({ serviceId }).lean();

  return res.status(200).json({
    success: true,
    data: test || null,
  });
});

export default { create, getById, update, getByServiceId };