// C-Arm Tube Housing Leakage controller
import mongoose from "mongoose";
import TubeHousingLeakage from "../../../../models/testTables/CArm/TubeHousingLeakage.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "C-Arm";

// Normalize body: frontend may send settings array and finalRemark; model has fcd, kv, ma, time, remark
function normalizeBody(body) {
  const firstSetting = Array.isArray(body.settings) && body.settings[0] ? body.settings[0] : body;
  return {
    fcd: body.fcd ?? firstSetting.fcd ?? "",
    kv: body.kv ?? firstSetting.kv ?? "",
    ma: body.ma ?? firstSetting.ma ?? "",
    time: body.time ?? firstSetting.time ?? "",
    workload: body.workload ?? "",
    leakageMeasurements: Array.isArray(body.leakageMeasurements) ? body.leakageMeasurements : [],
    toleranceValue: body.toleranceValue ?? "",
    toleranceOperator: body.toleranceOperator ?? "",
    toleranceTime: body.toleranceTime ?? "",
    remark: body.remark ?? body.finalRemark ?? "",
  };
}

const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const normalized = normalizeBody(req.body);

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

    let testRecord = await TubeHousingLeakage.findOne({ serviceId }).session(session);

    if (testRecord) {
      testRecord.fcd = normalized.fcd?.toString().trim() || "";
      testRecord.kv = normalized.kv?.toString().trim() || "";
      testRecord.ma = normalized.ma?.toString().trim() || "";
      testRecord.time = normalized.time?.toString().trim() || "";
      testRecord.workload = normalized.workload?.toString().trim() || "";
      testRecord.leakageMeasurements = normalized.leakageMeasurements;
      testRecord.toleranceValue = normalized.toleranceValue?.toString().trim() || "";
      testRecord.toleranceOperator = normalized.toleranceOperator?.toString().trim() || "";
      testRecord.toleranceTime = normalized.toleranceTime?.toString().trim() || "";
      testRecord.remark = normalized.remark?.toString().trim() || "";
    } else {
      testRecord = new TubeHousingLeakage({
        serviceId,
        reportId: serviceReport._id,
        fcd: normalized.fcd?.toString().trim() || "",
        kv: normalized.kv?.toString().trim() || "",
        ma: normalized.ma?.toString().trim() || "",
        time: normalized.time?.toString().trim() || "",
        workload: normalized.workload?.toString().trim() || "",
        leakageMeasurements: normalized.leakageMeasurements || [],
        toleranceValue: normalized.toleranceValue?.toString().trim() || "",
        toleranceOperator: normalized.toleranceOperator?.toString().trim() || "",
        toleranceTime: normalized.toleranceTime?.toString().trim() || "",
        remark: normalized.remark?.toString().trim() || "",
      });
    }

    await testRecord.save({ session });
    serviceReport.TubeHousingLeakageCArm = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
      data: {
        testId: testRecord._id.toString(),
        _id: testRecord._id.toString(),
        serviceId: testRecord.serviceId.toString(),
      },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("TubeHousingLeakageCArm Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save test",
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
    const testRecord = await TubeHousingLeakage.findById(testId).lean();
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
    console.error("getById TubeHousingLeakageCArm Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch test",
      error: error.message,
    });
  }
});

const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const normalized = normalizeBody(req.body);

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await TubeHousingLeakage.findById(testId).session(session);
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

    if (normalized.fcd !== undefined) testRecord.fcd = normalized.fcd?.toString().trim() || "";
    if (normalized.kv !== undefined) testRecord.kv = normalized.kv?.toString().trim() || "";
    if (normalized.ma !== undefined) testRecord.ma = normalized.ma?.toString().trim() || "";
    if (normalized.time !== undefined) testRecord.time = normalized.time?.toString().trim() || "";
    if (normalized.workload !== undefined) testRecord.workload = normalized.workload?.toString().trim() || "";
    if (normalized.leakageMeasurements !== undefined) testRecord.leakageMeasurements = normalized.leakageMeasurements;
    if (normalized.toleranceValue !== undefined) testRecord.toleranceValue = normalized.toleranceValue?.toString().trim() || "";
    if (normalized.toleranceOperator !== undefined) testRecord.toleranceOperator = normalized.toleranceOperator?.toString().trim() || "";
    if (normalized.toleranceTime !== undefined) testRecord.toleranceTime = normalized.toleranceTime?.toString().trim() || "";
    if (normalized.remark !== undefined) testRecord.remark = normalized.remark?.toString().trim() || "";

    await testRecord.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: { testId: testRecord._id.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("TubeHousingLeakageCArm Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
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
    const testRecord = await TubeHousingLeakage.findOne({ serviceId }).lean();

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
    console.error("getByServiceId TubeHousingLeakageCArm Error:", error);
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
