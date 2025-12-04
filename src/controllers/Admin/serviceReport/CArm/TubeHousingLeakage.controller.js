// controllers/TotalFilterationForCArmController.js
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import TotalFilterationForCArm from "../../../../models/testTables/CArm/TotalFilteration.model.js"; // Adjust path if needed
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";

const MACHINE_TYPE = "C-Arm"; // Change if this test is used for other types like "Interventional Radiology"

const create = asyncHandler(async (req, res) => {
  const { mAStations, measurements, tolerance, totalFiltration } = req.body;
  const { serviceId } = req.params;

  // === Basic Validation ===
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required in URL" });
  }
  if (!Array.isArray(mAStations) || mAStations.length === 0) {
    return res.status(400).json({ success: false, message: "mAStations array is required" });
  }
  if (!Array.isArray(measurements) || measurements.length === 0) {
    return res.status(400).json({ success: false, message: "measurements array is required" });
  }
  if (!tolerance || !tolerance.sign || !tolerance.value) {
    return res.status(400).json({ success: false, message: "tolerance (sign & value) is required" });
  }
  if (!totalFiltration || totalFiltration.measured === undefined || totalFiltration.required === undefined) {
    return res.status(400).json({ success: false, message: "totalFiltration.measured and .required are required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Validate Service & Machine Type
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

    // 2. Get or Create ServiceReport
    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // 3. Check if test already exists (by serviceId) → upsert logic
    let testRecord = await TotalFilterationForCArm.findOne({ serviceId }).session(session);

    if (testRecord) {
      // Update existing record
      testRecord.mAStations = mAStations;
      testRecord.measurements = measurements.map(m => ({
        appliedKvp: m.appliedKvp?.trim() || "",
        measuredValues: m.measuredValues || [],
        averageKvp: m.averageKvp || "",
        remarks: m.remarks || "-",
      }));
      testRecord.tolerance = {
        sign: tolerance.sign,
        value: tolerance.value.toString().trim(),
      };
      testRecord.totalFiltration = {
        measured: totalFiltration.measured?.toString().trim() || "",
        required: totalFiltration.required?.toString().trim() || "",
      };
    } else {
      // Create new
      testRecord = new TotalFilterationForCArm({
        serviceId,
        reportId: serviceReport._id,
        mAStations,
        measurements: measurements.map(m => ({
          appliedKvp: m.appliedKvp?.trim() || "",
          measuredValues: m.measuredValues || [],
          averageKvp: m.averageKvp || "",
          remarks: m.remarks || "-",
        })),
        tolerance: {
          sign: tolerance.sign,
          value: tolerance.value.toString().trim(),
        },
        totalFiltration: {
          measured: totalFiltration.measured?.toString().trim() || "",
          required: totalFiltration.required?.toString().trim() || "",
        },
      });
    }

    await testRecord.save({ session });

    // 4. Link test to ServiceReport (optional field name – adjust if needed in your ServiceReport schema)
    serviceReport.TotalFilterationForCArm = testRecord._id;
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
    console.error("TotalFilterationForCArm Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save test",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

const update = asyncHandler(async (req, res) => {
  const { mAStations, measurements, tolerance, totalFiltration } = req.body;
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required in URL" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await TotalFilterationForCArm.findById(testId).session(session);
    if (!testRecord) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Test record not found" });
    }

    // Optional: Re-validate machine type
    const service = await Service.findById(testRecord.serviceId).session(session);
    if (service && service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
      });
    }

    // Update fields only if provided
    if (mAStations) testRecord.mAStations = mAStations;
    if (measurements) {
      testRecord.measurements = measurements.map(m => ({
        appliedKvp: m.appliedKvp?.trim() || "",
        measuredValues: m.measuredValues || [],
        averageKvp: m.averageKvp || "",
        remarks: m.remarks || "-",
      }));
    }
    if (tolerance) {
      testRecord.tolerance = {
        sign: tolerance.sign || testRecord.tolerance.sign,
        value: tolerance.value ? tolerance.value.toString().trim() : testRecord.tolerance.value,
      };
    }
    if (totalFiltration) {
      testRecord.totalFiltration = {
        measured: totalFiltration.measured !== undefined ? totalFiltration.measured.toString().trim() : testRecord.totalFiltration.measured,
        required: totalFiltration.required !== undefined ? totalFiltration.required.toString().trim() : testRecord.totalFiltration.required,
      };
    }

    await testRecord.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: { testId: testRecord._id.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("TotalFilterationForCArm Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
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
    const testRecord = await TotalFilterationForCArm.findById(testId).lean();
    if (!testRecord) {
      return res.status(404).json({ success: false, message: "Test record not found" });
    }

    // Optional machine type check
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

const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  try {
    const testRecord = await TotalFilterationForCArm.findOne({ serviceId }).lean();

    if (!testRecord) {
      return res.json({ success: true, data: null }); // First time user → no saved data
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

export default {
  create,
  update,
  getById,
  getByServiceId,
};