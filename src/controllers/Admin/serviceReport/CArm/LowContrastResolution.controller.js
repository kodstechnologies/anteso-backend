// controllers/LowContrastResolutionController.js
import LowContrastResolution from "../../../../models/testTables/CArm/LowContrastResolution.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "C-Arm";

/** Match generate page: PASS only when measured < recommended standard (smaller hole = better) */
function computeRemark(smallestHoleSize, recommendedStandard) {
  const measured = parseFloat(smallestHoleSize);
  const recommended = parseFloat(recommendedStandard || "3.0");
  if (isNaN(measured) || isNaN(recommended)) return "";
  return measured < recommended ? "PASS" : "FAIL";
}

// CREATE / UPSERT by serviceId — With Transaction
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { smallestHoleSize, recommendedStandard, tolerance, reportId } = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "Valid Service ID is required",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const service = await Service.findById(serviceId).session(session);
    if (!service) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (service.machineType !== MACHINE_TYPE) {
      await session.abortTransaction();
      session.endSession();
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

    const holeStr = smallestHoleSize?.toString().trim() || "";
    const standardStr = recommendedStandard?.toString().trim() || "3.0";
    const remark = computeRemark(holeStr, standardStr);

    let testRecord = await LowContrastResolution.findOne({ serviceId }).session(session);

    if (testRecord) {
      testRecord.smallestHoleSize = holeStr;
      testRecord.recommendedStandard = standardStr;
      testRecord.tolerance = tolerance?.toString().trim() || "";
      testRecord.remark = remark;
      testRecord.reportId = reportId || serviceReport._id;
      await testRecord.save({ session });
    } else {
      const created = await LowContrastResolution.create(
        [
          {
            serviceId,
            reportId: reportId || serviceReport._id,
            smallestHoleSize: holeStr,
            recommendedStandard: standardStr,
            tolerance: tolerance?.toString().trim() || "",
            remark,
          },
        ],
        { session }
      );
      testRecord = created[0];
    }

    serviceReport.LowContrastResolutionCArm = testRecord._id;
    await serviceReport.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Low Contrast Resolution test saved successfully",
      data: testRecord,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Create Low Contrast Resolution failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create test. Please try again.",
    });
  }
});

// GET BY TEST ID
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Test ID",
    });
  }

  const test = await LowContrastResolution.findById(testId)
    .populate("serviceId", "machineName serialNumber manufacturer model")
    .populate("reportId", "reportNumber createdAt");

  if (!test) {
    return res.status(404).json({
      success: false,
      message: "Low Contrast Resolution test not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// GET BY SERVICE ID — prefer report-linked record so generate/view stay in sync
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Service ID",
    });
  }

  const serviceReport = await ServiceReport.findOne({ serviceId })
    .select("LowContrastResolutionCArm")
    .lean();

  let test = null;
  if (serviceReport?.LowContrastResolutionCArm) {
    test = await LowContrastResolution.findById(serviceReport.LowContrastResolutionCArm)
      .populate("serviceId", "machineName serialNumber manufacturer model")
      .populate("reportId", "reportNumber");
  }

  if (!test) {
    test = await LowContrastResolution.findOne({ serviceId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("serviceId", "machineName serialNumber manufacturer model")
      .populate("reportId", "reportNumber");
  }

  return res.status(200).json({
    success: true,
    data: test || null,
  });
});

// UPDATE - With Transaction
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { smallestHoleSize, recommendedStandard, tolerance } = req.body;

  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Test ID",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const holeStr = smallestHoleSize?.toString().trim() || "";
    const standardStr = recommendedStandard?.toString().trim() || "3.0";
    const remark = computeRemark(holeStr, standardStr);

    const updatedTest = await LowContrastResolution.findByIdAndUpdate(
      testId,
      {
        smallestHoleSize: holeStr,
        recommendedStandard: standardStr,
        tolerance: tolerance?.toString().trim() || "",
        remark,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedTest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    if (updatedTest?.serviceId) {
      const serviceReport = await ServiceReport.findOne({
        serviceId: updatedTest.serviceId,
      }).session(session);
      if (
        serviceReport &&
        (!serviceReport.LowContrastResolutionCArm ||
          serviceReport.LowContrastResolutionCArm.toString() !== testId)
      ) {
        serviceReport.LowContrastResolutionCArm = testId;
        await serviceReport.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Low Contrast Resolution test updated successfully",
      data: updatedTest,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Update Low Contrast Resolution failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update test. Please try again.",
    });
  }
});

export default {
  create,
  getById,
  getByServiceId,
  update,
};
