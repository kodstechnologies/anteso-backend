import mongoose from 'mongoose';
import TubeHousingLeakage from '../../../../models/testTables/InventionalRadiology/tubeHousingLeakage.model.js';
import ServiceReport from '../../../../models/serviceReports/serviceReport.model.js';
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { fcd, kv, ma, time, workload, leakageMeasurements, toleranceValue, toleranceOperator, toleranceTime, remark, tubeId } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: 'Valid serviceId is required' });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new ServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    const tubeIdValue = tubeId === 'null' || tubeId === '' ? null : tubeId || null;
    let testRecord = await TubeHousingLeakage.findOne({ serviceId, tubeId: tubeIdValue }).session(session);

    if (testRecord) {
      if (fcd !== undefined) testRecord.fcd = fcd;
      if (kv !== undefined) testRecord.kv = kv;
      if (ma !== undefined) testRecord.ma = ma;
      if (time !== undefined) testRecord.time = time;
      if (workload !== undefined) testRecord.workload = workload;
      if (leakageMeasurements !== undefined) testRecord.leakageMeasurements = leakageMeasurements;
      if (toleranceValue !== undefined) testRecord.toleranceValue = toleranceValue;
      if (toleranceOperator !== undefined) testRecord.toleranceOperator = toleranceOperator;
      if (toleranceTime !== undefined) testRecord.toleranceTime = toleranceTime;
      if (remark !== undefined) testRecord.remark = remark;
    } else {
      testRecord = new TubeHousingLeakage({
        serviceId,
        reportId: serviceReport._id,
        tubeId: tubeIdValue,
        fcd: fcd || '',
        kv: kv || '',
        ma: ma || '',
        time: time || '',
        workload: workload || '',
        leakageMeasurements: leakageMeasurements || [],
        toleranceValue: toleranceValue || '',
        toleranceOperator: toleranceOperator || '',
        toleranceTime: toleranceTime || '',
        remark: remark || '',
      });
    }

    await testRecord.save({ session });
    serviceReport.TubeHousingLeakageInventionalRadiology = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? 'Test created successfully' : 'Test updated successfully',
      data: { _id: testRecord._id.toString(), serviceId: testRecord.serviceId.toString() },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('TubeHousingLeakage Create Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save test', error: error.message });
  } finally {
    if (session) session.endSession();
  }
});

const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: 'Valid testId is required' });
  }
  try {
    const testRecord = await TubeHousingLeakage.findById(testId).lean();
    if (!testRecord) {
      return res.status(404).json({ success: false, message: 'Test record not found' });
    }
    return res.json({ success: true, data: testRecord });
  } catch (error) {
    console.error('getById Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch test', error: error.message });
  }
});

const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { fcd, kv, ma, time, workload, leakageMeasurements, toleranceValue, toleranceOperator, toleranceTime, remark } = req.body;
  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: 'Valid testId is required' });
  }
  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const testRecord = await TubeHousingLeakage.findById(testId).session(session);
    if (!testRecord) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Test record not found' });
    }
    if (fcd !== undefined) testRecord.fcd = fcd;
    if (kv !== undefined) testRecord.kv = kv;
    if (ma !== undefined) testRecord.ma = ma;
    if (time !== undefined) testRecord.time = time;
    if (workload !== undefined) testRecord.workload = workload;
    if (leakageMeasurements !== undefined) testRecord.leakageMeasurements = leakageMeasurements;
    if (toleranceValue !== undefined) testRecord.toleranceValue = toleranceValue;
    if (toleranceOperator !== undefined) testRecord.toleranceOperator = toleranceOperator;
    if (toleranceTime !== undefined) testRecord.toleranceTime = toleranceTime;
    if (remark !== undefined) testRecord.remark = remark;
    await testRecord.save({ session });
    await session.commitTransaction();
    return res.json({ success: true, message: 'Updated successfully', data: { _id: testRecord._id.toString() } });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Update Error:', error);
    return res.status(500).json({ success: false, message: 'Update failed', error: error.message });
  } finally {
    if (session) session.endSession();
  }
});

const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: 'Valid serviceId is required' });
  }
  try {
    const { tubeId } = req.query;
    const query = { serviceId };
    if (tubeId !== undefined) {
      query.tubeId = tubeId === 'null' ? null : tubeId;
    }
    const testRecord = await TubeHousingLeakage.findOne(query).lean();
    if (!testRecord) {
      return res.json({ success: true, data: null });
    }
    return res.json({ success: true, data: testRecord });
  } catch (error) {
    console.error('getByServiceId Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch test', error: error.message });
  }
});

export default { create, getById, update, getByServiceId };
