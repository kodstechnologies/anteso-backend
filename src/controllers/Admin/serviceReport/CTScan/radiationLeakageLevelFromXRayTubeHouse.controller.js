// controllers/radiationLeakageController.js
import mongoose from 'mongoose';
import RadiationLeakageLevel from '../../../../models/testTables/CTScan/radiationLeakageLevelFromXRayTubeHouse.model.js';
import serviceReportModel from '../../../../models/serviceReports/serviceReport.model.js'; // Adjust path
import Services from '../../../../models/Services.js'; // Adjust path
import { asyncHandler } from '../../../../utils/AsyncHandler.js';

/**
 * @desc Create Radiation Leakage Test + Link to ServiceReport
 * @route POST /api/radiation-leakage/:serviceId
 * @access Private
 */
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const {
    fcd,
    kv,
    ma,
    time,
    workload,
    workloadUnit = 'mA·min/week',
    measurementSettings = [],
    leakageMeasurements = [],
    tolerance,
    toleranceValue,
    toleranceOperator,
    toleranceTime,
    remark,
    notes = '',
    tubeId,
  } = req.body;

  if (!serviceId) {
    return res.status(400).json({ success: false, message: 'serviceId is required' });
  }
  if (!Array.isArray(leakageMeasurements)) {
    return res.status(400).json({ success: false, message: 'leakageMeasurements must be an array' });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const service = await Services.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    if (service.machineType !== 'Computed Tomography') {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test is only for Computed Tomography. Found: ${service.machineType}`,
      });
    }

    let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new serviceReportModel({ serviceId });
      await serviceReport.save({ session });
    }

    const tubeIdValue = tubeId === 'null' || tubeId === '' ? null : tubeId || null;
    let testRecord = await RadiationLeakageLevel.findOne({ serviceId, tubeId: tubeIdValue }).session(session);

    const payload = {
      serviceId,
      reportId: serviceReport._id,
      tubeId: tubeIdValue,
      workload: (workload !== undefined && workload !== null ? String(workload) : '') || testRecord?.workload || '',
      workloadUnit,
      fcd: fcd !== undefined ? String(fcd) : testRecord?.fcd ?? '',
      kv: kv !== undefined ? String(kv) : (measurementSettings?.[0]?.kv !== undefined ? String(measurementSettings[0].kv) : testRecord?.kv ?? ''),
      ma: ma !== undefined ? String(ma) : (measurementSettings?.[0]?.ma !== undefined ? String(measurementSettings[0].ma) : testRecord?.ma ?? ''),
      time: time !== undefined ? String(time) : (measurementSettings?.[0]?.time !== undefined ? String(measurementSettings[0].time) : testRecord?.time ?? ''),
      leakageMeasurements,
      toleranceValue: toleranceValue !== undefined ? String(toleranceValue) : (tolerance !== undefined ? String(tolerance) : testRecord?.toleranceValue ?? ''),
      toleranceOperator: toleranceOperator || testRecord?.toleranceOperator || 'less than or equal to',
      toleranceTime: toleranceTime !== undefined ? String(toleranceTime) : testRecord?.toleranceTime ?? '1',
      remark: remark !== undefined ? String(remark) : testRecord?.remark ?? '',
      notes: notes !== undefined ? String(notes) : testRecord?.notes ?? '',
    };
    if (Array.isArray(measurementSettings) && measurementSettings.length > 0) {
      payload.measurementSettings = measurementSettings;
    }

    if (testRecord) {
      Object.assign(testRecord, payload);
    } else {
      testRecord = new RadiationLeakageLevel(payload);
    }

    await testRecord.save({ session });

    // 4️⃣ Link Test to ServiceReport
    serviceReport.RadiationLeakageLevel = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    return res.json({
      success: true,
      message: testRecord.isNew ? 'Created' : 'Updated',
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
        console.error('Abort failed:', abortError);
      }
    }
    console.error('RadiationLeakageLevel Create Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Operation failed',
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});


/**
 * @desc Get test by testId (_id)
 * @route GET /api/radiation-leakage/test/:testId
 * @access Private
 */
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId) {
    return res.status(400).json({ success: false, message: 'testId is required' });
  }

  try {
    const testRecord = await RadiationLeakageLevel.findById(testId).lean().exec();
    if (!testRecord) {
      return res.status(404).json({ success: false, message: 'Test record not found' });
    }

    return res.json({
      success: true,
      data: testRecord,
    });
  } catch (error) {
    console.error('GetById Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch',
      error: error.message,
    });
  }
});

/**
 * @desc Update test by testId
 * @route PUT /api/radiation-leakage/test/:testId
 * @access Private
 */
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const {
    fcd,
    kv,
    ma,
    time,
    workload,
    workloadUnit,
    measurementSettings,
    leakageMeasurements,
    tolerance,
    toleranceValue,
    toleranceOperator,
    toleranceTime,
    remark,
    notes,
    tubeId,
  } = req.body;

  if (!testId) {
    return res.status(400).json({ success: false, message: 'testId is required' });
  }
  if (leakageMeasurements !== undefined && !Array.isArray(leakageMeasurements)) {
    return res.status(400).json({ success: false, message: 'leakageMeasurements must be an array' });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await RadiationLeakageLevel.findById(testId).session(session);
    if (!testRecord) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Test record not found' });
    }

    const tubeIdValue = tubeId !== undefined ? (tubeId === null || tubeId === 'null' ? null : tubeId) : undefined;
    if (tubeIdValue !== undefined && testRecord.tubeId !== tubeIdValue) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Tube mismatch: this record belongs to a different tube.' });
    }

    const service = await Services.findById(testRecord.serviceId).session(session);
    if (!service || service.machineType !== 'Computed Tomography') {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'This test can only be updated for Computed Tomography',
      });
    }

    if (fcd !== undefined) testRecord.fcd = String(fcd);
    if (kv !== undefined) testRecord.kv = String(kv);
    if (ma !== undefined) testRecord.ma = String(ma);
    if (time !== undefined) testRecord.time = String(time);
    if (workload !== undefined) testRecord.workload = String(workload);
    if (workloadUnit !== undefined) testRecord.workloadUnit = workloadUnit;
    if (measurementSettings !== undefined) testRecord.measurementSettings = measurementSettings;
    if (leakageMeasurements !== undefined) testRecord.leakageMeasurements = leakageMeasurements;
    if (toleranceValue !== undefined) testRecord.toleranceValue = String(toleranceValue);
    if (tolerance !== undefined) testRecord.toleranceValue = String(tolerance);
    if (toleranceOperator !== undefined) testRecord.toleranceOperator = toleranceOperator;
    if (toleranceTime !== undefined) testRecord.toleranceTime = String(toleranceTime);
    if (remark !== undefined) testRecord.remark = String(remark);
    if (notes !== undefined) testRecord.notes = notes;
    if (tubeId !== undefined) testRecord.tubeId = tubeId === null || tubeId === 'null' ? null : tubeId;

    await testRecord.save({ session });
    await session.commitTransaction();

    return res.json({
      success: true,
      message: 'Updated successfully',
      data: { testId: testRecord._id },
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Update Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId) {
    return res.status(400).json({ success: false, message: 'serviceId is required' });
  }

  try {
    // Build query with optional tubeId from query parameter
    const { tubeId } = req.query;
    const query = { serviceId };
    if (tubeId !== undefined) {
      query.tubeId = tubeId === 'null' ? null : tubeId;
    }
    const testRecord = await RadiationLeakageLevel.findOne(query).lean().exec();

    if (!testRecord) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const service = await Services.findById(serviceId).lean();
    if (service && service.machineType !== 'Computed Tomography') {
      return res.status(403).json({
        success: false,
        message: `This test belongs to ${service.machineType}, not Computed Tomography`,
      });
    }

    return res.json({
      success: true,
      data: testRecord,
    });
  } catch (error) {
    console.error('getByServiceId Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch test record',
      error: error.message,
    });
  }
});

export default { create, getById, update, getByServiceId };