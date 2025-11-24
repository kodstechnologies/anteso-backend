// controllers/Admin/serviceReport/InventionalRadiology/AccuracyOfIrradiationTime.js
import AccuracyOfIrradiationTime from "../../../../models/testTables/InventionalRadiology/accuracyOfIrradiationTime.model.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

// CREATE or UPDATE (Upsert) by serviceId
const create = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const { testConditions, irradiationTimes, tolerance } = req.body;

  if (!serviceId) {
    return res.status(400).json({ message: "serviceId is required" });
  }

  const existing = await AccuracyOfIrradiationTime.findOneAndUpdate(
    { serviceId },
    {
      serviceId,
      testConditions: testConditions || { fcd: "", kv: "", ma: "" },
      irradiationTimes: irradiationTimes || [],
      tolerance: tolerance || { operator: "<=", value: "" },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(201).json({
    success: true,
    data: existing,
    message: "Accuracy of Irradiation Time saved successfully",
  });
});

// GET by testId (Mongo _id)
const getById = asyncHandler(async (req, res) => {
  const { testId } = req.params;

  const test = await AccuracyOfIrradiationTime.findById(testId);

  if (!test) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: test,
  });
});

// UPDATE by testId (Mongo _id)
const update = asyncHandler(async (req, res) => {
  const { testId } = req.params;
  const { testConditions, irradiationTimes, tolerance } = req.body;

  const updatedTest = await AccuracyOfIrradiationTime.findByIdAndUpdate(
    testId,
    {
      testConditions: testConditions || { fcd: "", kv: "", ma: "" },
      irradiationTimes: irradiationTimes || [],
      tolerance: tolerance || { operator: "<=", value: "" },
      updatedAt: Date.now(),
    },
    { new: true, runValidators: true }
  );

  if (!updatedTest) {
    return res.status(404).json({ message: "Test data not found" });
  }

  return res.status(200).json({
    success: true,
    data: updatedTest,
    message: "Updated successfully",
  });
});

export default { create, getById, update };