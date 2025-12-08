// controllers/Admin/serviceReport/LeadApron/LeadApronTest.controller.js
import mongoose from "mongoose";
import LeadApronTest from "../../../../models/testTables/LeadApron/LeadApronTest.model.js";
import LeadApronServiceReport from "../../../../models/serviceReports/leadApronServiceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Lead Apron";

// Helper function to check if machine type is valid
const isValidMachineType = (machineType) => {
  return machineType === MACHINE_TYPE;
};

// CREATE or UPDATE (Upsert) by serviceId with transaction
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { reportDetails, operatingParameters, doseMeasurements, footer } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    // Validate Service & Machine Type
    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (!isValidMachineType(service.machineType)) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: ${service.machineType}`,
      });
    }

    // Get or Create LeadApronServiceReport
    let serviceReport = await LeadApronServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
      serviceReport = new LeadApronServiceReport({ serviceId });
      await serviceReport.save({ session });
    }

    // Upsert Test Record (create or update)
    let testRecord = await LeadApronTest.findOne({ serviceId }).session(session);

    if (testRecord) {
      // Update existing
      if (reportDetails !== undefined) testRecord.reportDetails = { ...testRecord.reportDetails, ...reportDetails };
      if (operatingParameters !== undefined) testRecord.operatingParameters = { ...testRecord.operatingParameters, ...operatingParameters };
      if (doseMeasurements !== undefined) testRecord.doseMeasurements = { ...testRecord.doseMeasurements, ...doseMeasurements };
      if (footer !== undefined) testRecord.footer = { ...testRecord.footer, ...footer };
    } else {
      // Create new
      testRecord = new LeadApronTest({
        serviceId,
        serviceReportId: serviceReport._id,
        reportDetails: reportDetails || {
          institutionName: "",
          institutionCity: "",
          equipmentType: "Lead Apron",
          equipmentId: "",
          personTesting: "",
          serviceAgency: "",
          testDuration: "",
        },
        operatingParameters: operatingParameters || {
          ffd: "",
          kv: "",
          mas: "",
        },
        doseMeasurements: doseMeasurements || {
          neutral: "",
          position1: "",
          position2: "",
          position3: "",
          averageValue: "",
          percentReduction: "",
          remark: "",
        },
        footer: footer || {
          place: "",
          signature: "",
          serviceEngineerName: "",
          serviceAgencyName: "",
          serviceAgencySeal: "",
        },
      });
    }

    await testRecord.save({ session });

    // Link back to LeadApronServiceReport
    serviceReport.LeadApronTest = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();

    // Fetch the saved record to return full data
    const savedTest = await LeadApronTest.findById(testRecord._id).lean();

    return res.json({
      success: true,
      message: testRecord.isNew ? "Test created successfully" : "Test updated successfully",
      data: savedTest,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("LeadApronTest Create Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save test",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by testId (Mongo _id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }

  try {
    const testRecord = await LeadApronTest.findById(testId).lean();
    if (!testRecord) {
      return res.status(404).json({ success: false, message: "Test record not found" });
    }

    const service = await Service.findById(testRecord.serviceId).lean();
    if (service && !isValidMachineType(service.machineType)) {
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

// UPDATE by testId (Mongo _id) with transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { reportDetails, operatingParameters, doseMeasurements, footer } = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ success: false, message: "Valid testId is required" });
  }

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const testRecord = await LeadApronTest.findById(testId).session(session);
    if (!testRecord) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Test record not found" });
    }

    // Re-validate machine type
    const service = await Service.findById(testRecord.serviceId).session(session);
    if (service && !isValidMachineType(service.machineType)) {
      await session.abortTransaction();
      return res.status(403).json({
        success: false,
        message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
      });
    }

    // Update fields
    if (reportDetails !== undefined) {
      testRecord.reportDetails = { ...testRecord.reportDetails, ...reportDetails };
    }
    if (operatingParameters !== undefined) {
      testRecord.operatingParameters = { ...testRecord.operatingParameters, ...operatingParameters };
    }
    if (doseMeasurements !== undefined) {
      testRecord.doseMeasurements = { ...testRecord.doseMeasurements, ...doseMeasurements };
    }
    if (footer !== undefined) {
      testRecord.footer = { ...testRecord.footer, ...footer };
    }

    await testRecord.save({ session });
    await session.commitTransaction();

    // Fetch the updated record to return full data
    const updatedTest = await LeadApronTest.findById(testId).lean();

    return res.json({
      success: true,
      message: "Updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error("LeadApronTest Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: error.message,
    });
  } finally {
    if (session) session.endSession();
  }
});

// GET by serviceId (convenience for frontend)
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({ success: false, message: "Valid serviceId is required" });
  }

  try {
    const testRecord = await LeadApronTest.findOne({ serviceId }).lean();

    if (!testRecord) {
      return res.json({ success: true, data: null });
    }

    const service = await Service.findById(serviceId).lean();
    if (service && !isValidMachineType(service.machineType)) {
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

