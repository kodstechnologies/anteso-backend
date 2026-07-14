import mongoose from "mongoose";
import AuthorizedSignatory from "../../models/authorizedSignatory.model.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { uploadToS3 } from "../../utils/s3Upload.js";

const resolveSignature = async (req) => {
  if (req.file) {
    const { url } = await uploadToS3(req.file);
    return url;
  }
  const signature = String(req.body?.signature ?? "").trim();
  return signature || null;
};

const create = asyncHandler(async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  let signature;
  try {
    signature = await resolveSignature(req);
  } catch (err) {
    console.error("Signature upload error:", err);
    throw new ApiError(500, "Failed to upload signature file");
  }

  if (!signature) {
    throw new ApiError(400, "Signature is required (file or URL)");
  }

  const existing = await AuthorizedSignatory.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (existing) {
    throw new ApiError(409, "Authorized signatory with this name already exists");
  }

  const signatory = await AuthorizedSignatory.create({ name, signature });

  return res
    .status(201)
    .json(new ApiResponse(201, signatory, "Authorized signatory created successfully"));
});

const getAll = asyncHandler(async (req, res) => {
  const signatories = await AuthorizedSignatory.find().sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, signatories, "Authorized signatories fetched successfully"));
});

const getById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid authorized signatory ID");
  }

  const signatory = await AuthorizedSignatory.findById(id);
  if (!signatory) {
    throw new ApiError(404, "Authorized signatory not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, signatory, "Authorized signatory fetched successfully"));
});

const updateById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid authorized signatory ID");
  }

  const signatory = await AuthorizedSignatory.findById(id);
  if (!signatory) {
    throw new ApiError(404, "Authorized signatory not found");
  }

  const name = req.body?.name != null ? String(req.body.name).trim() : undefined;
  if (name !== undefined) {
    if (!name) {
      throw new ApiError(400, "Name cannot be empty");
    }
    const duplicate = await AuthorizedSignatory.findOne({
      _id: { $ne: id },
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (duplicate) {
      throw new ApiError(409, "Authorized signatory with this name already exists");
    }
    signatory.name = name;
  }

  let signature;
  try {
    signature = await resolveSignature(req);
  } catch (err) {
    console.error("Signature upload error:", err);
    throw new ApiError(500, "Failed to upload signature file");
  }
  if (signature) {
    signatory.signature = signature;
  }

  await signatory.save();

  return res
    .status(200)
    .json(new ApiResponse(200, signatory, "Authorized signatory updated successfully"));
});

const deleteById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid authorized signatory ID");
  }

  const deleted = await AuthorizedSignatory.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, "Authorized signatory not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleted, "Authorized signatory deleted successfully"));
});

export default { create, getAll, getById, updateById, deleteById };
