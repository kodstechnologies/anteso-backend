import mongoose from "mongoose";
import Services from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import MeasurementOfMaLinearity from "../../../../models/testTables/InventionalRadiology/measurementOfMaLinearity.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";

const MACHINE_TYPE = "Interventional Radiology";

const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { table1, table2, tolerance, tubeId } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }
  if (!Array.isArray(table1) || !Array.isArray(table2)) {
    return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const service = await Services.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: `${MACHINE_TYPE} only` });
    }

    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    const tubeIdValue = tubeId || null;
    let testRecord = await MeasurementOfMaLinearity.findOne({ serviceId, tubeId: tubeIdValue }).session(session);
    const payload = {
      table1,
      table2,
      tolerance: tolerance?.toString().trim() || "0.1",
      serviceId,
      serviceReportId: serviceReport._id,
      tubeId: tubeIdValue,
    };

    if (testRecord) Object.assign(testRecord, payload);
    else testRecord = new MeasurementOfMaLinearity(payload);

    await testRecord.save({ session });

    serviceReport.MeasurementOfMaLinearityInventionalRadiology = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: "Saved",
      data: { testId: testRecord._id.toString(), serviceReportId: serviceReport._id.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    return res.status(500).json({ success: false, message: "Operation failed", error: error.message });
  } finally {
    if (session) session.endSession();
  }
});

const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  if (!testId) return res.status(400).json({ success: false, message: "testId is required" });
  const rec = await MeasurementOfMaLinearity.findById(testId).lean().exec();
  if (!rec) return res.status(404).json({ success: false, message: "Not found" });
  return res.json({ success: true, data: rec });
});

const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { table1, table2, tolerance, tubeId } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }
  if (!Array.isArray(table1) || !Array.isArray(table2)) {
    return res.status(400).json({ success: false, message: "table1 and table2 must be arrays" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const rec = await MeasurementOfMaLinearity.findById(testId).session(session);
    if (!rec) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const service = await Services.findById(rec.serviceId).session(session);
    if (!service || service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: `${MACHINE_TYPE} only` });
    }

    const tubeIdValue = tubeId !== undefined ? (tubeId === null || tubeId === "null" ? null : tubeId) : undefined;
    if (tubeIdValue !== undefined && rec.tubeId !== tubeIdValue) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Tube mismatch" });
    }

    rec.table1 = table1;
    rec.table2 = table2;
    rec.tolerance = tolerance?.toString().trim() || "0.1";
    await rec.save({ session });

    await session.commitTransaction();
    return res.json({ success: true, message: "Updated", data: { testId: rec._id.toString() } });
  } catch (error) {
    if (session) await session.abortTransaction();
    return res.status(500).json({ success: false, message: "Update failed", error: error.message });
  } finally {
    if (session) session.endSession();
  }
});

const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  if (!serviceId) return res.status(400).json({ success: false, message: "serviceId is required" });

  const { tubeId } = req.query;
  const query = { serviceId };
  if (tubeId !== undefined) query.tubeId = tubeId === "null" ? null : tubeId;

  const rec = await MeasurementOfMaLinearity.findOne(query).lean().exec();
  if (!rec) return res.status(200).json({ success: true, data: null });

  const service = await Services.findById(serviceId).lean();
  if (service && service.machineType !== MACHINE_TYPE) {
    return res.status(403).json({ success: false, message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}` });
  }

  return res.json({ success: true, data: rec });
});

export default { create, getById, update, getByServiceId };

