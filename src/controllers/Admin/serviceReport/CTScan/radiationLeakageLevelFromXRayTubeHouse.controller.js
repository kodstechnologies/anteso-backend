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
    workload,
    workloadUnit = 'mA·min/week',
    measurementSettings = [],
    leakageMeasurements = [],
    tolerance = '',
    notes = '',
  } = req.body;

  // === Validate Input ===
  if (!serviceId) {
    return res.status(400).json({ success: false, message: 'serviceId is required' });
  }

  if (!workload) {
    return res.status(400).json({ success: false, message: 'workload is required' });
  }

  if (!Array.isArray(measurementSettings) || !Array.isArray(leakageMeasurements)) {
    return res.status(400).json({
      success: false,
      message: 'measurementSettings and leakageMeasurements must be arrays',
    });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // 1️⃣ Validate Service + Computed Tomography
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

    // 2️⃣ Get or Create ServiceReport
    let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new serviceReportModel({ serviceId });
      await serviceReport.save({ session });
    }

    // 3️⃣ Save Test Data (Upsert)
    let testRecord = await RadiationLeakageLevel.findOne({ serviceId }).session(session);

    const payload = {
      workload,
      workloadUnit,
      measurementSettings,
      leakageMeasurements,
      tolerance: tolerance?.toString().trim() || '',
      notes,
      serviceId,
      reportId: serviceReport._id,
    };

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
    measurementSettings,
    leakageMeasurements,
    tolerance,
    notes,
  } = req.body;

  if (!testId) {
    return res.status(400).json({ success: false, message: 'testId is required' });
  }
  if (
    measurementSettings !== undefined && !Array.isArray(measurementSettings) ||
    leakageMeasurements !== undefined && !Array.isArray(leakageMeasurements)
  ) {
    return res.status(400).json({ success: false, message: 'measurementSettings and leakageMeasurements must be arrays' });
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

    // Validate Computed Tomography
    const service = await Services.findById(testRecord.serviceId).session(session);
    if (!service || service.machineType !== 'Computed Tomography') {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: 'This test can only be updated for Computed Tomography',
      });
    }

    // Update fields
    if (measurementSettings !== undefined) testRecord.measurementSettings = measurementSettings;
    if (leakageMeasurements !== undefined) testRecord.leakageMeasurements = leakageMeasurements;
    if (tolerance !== undefined) testRecord.tolerance = tolerance?.toString().trim() || '';
    if (notes !== undefined) testRecord.notes = notes;

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
    const testRecord = await RadiationLeakageLevel.findOne({ serviceId }).lean().exec();

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