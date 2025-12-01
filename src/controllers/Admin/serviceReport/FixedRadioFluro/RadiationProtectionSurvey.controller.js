// controllers/Admin/serviceReport/FixedRadioFluro/RadiationProtectionSurvey.controller.js
import mongoose from "mongoose";
import RadiationProtectionSurvey from "../../../../models/testTables/FixedRadioFluro/RadiationPotectionSurvay.model.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

// CREATE - First time save (rejects if already exists for that service)
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const payload = req.body;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "Valid serviceId is required",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existing = await RadiationProtectionSurvey.findOne({ serviceId }).session(session);
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Radiation Protection Survey already exists for this service",
      });
    }

    const [survey] = await RadiationProtectionSurvey.create(
      [
        {
          ...payload,
          serviceId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Radiation Protection Survey created successfully",
      data: survey,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

// GET BY SERVICE ID
const getByServiceId = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;

  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return res.status(400).json({
      success: false,
      message: "Valid serviceId is required",
    });
  }

  const survey = await RadiationProtectionSurvey.findOne({ serviceId }).lean();

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: survey,
  });
});

// GET BY TEST ID
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid testId",
    });
  }

  const survey = await RadiationProtectionSurvey.findById(testId).lean();

  if (!survey) {
    return res.status(404).json({
      success: false,
      message: "Radiation Protection Survey not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: survey,
  });
});

// UPDATE - By testId
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const payload = req.body;

  if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({
      success: false,
      message: "Valid testId is required",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const updatedSurvey = await RadiationProtectionSurvey.findByIdAndUpdate(
      testId,
      {
        $set: {
          ...payload,
          updatedAt: Date.now(),
        },
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedSurvey) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Radiation Protection Survey not found",
      });
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Radiation Protection Survey updated successfully",
      data: updatedSurvey,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export default {
  create,
  getById,
  update,
  getByServiceId,
};


