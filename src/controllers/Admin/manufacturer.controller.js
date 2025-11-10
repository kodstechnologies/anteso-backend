import Manufacturer from '../../models/manufacturer.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

import { asyncHandler } from '../../utils/AsyncHandler.js'


export const addManufacturer = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            address,
            password,
            contactPersonName,
            city,
            state,
            pincode,
            branch,
            mouValidity,
            qaTests = [],
            services = [],
            travelCost,
            cost,
        } = req.body;

        console.log("🚀 ~ req.body:", req.body);

        if (!name || !email || !phone) {
            return res
                .status(200)
                .json(new ApiResponse(400, null, "Name, Email, and Phone are required"));
        }

        // ✅ Check duplicates
        const existingManufacturer = await Manufacturer.findOne({
            $or: [{ phone }, { email }],
        });

        if (existingManufacturer) {
            const duplicateField =
                existingManufacturer.phone === phone ? "phone number" : "email";
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        400,
                        null,
                        `Manufacturer with this ${duplicateField} already exists`
                    )
                );
        }

        // ✅ Identify creator (Admin or Staff)
        const tokenUser = req.admin || req.user;
        const creatorId = tokenUser?._id || tokenUser?.id;
        let creatorModel = tokenUser?.role === "admin" ? "Admin" : "User";

        if (!creatorId) {
            return res
                .status(200)
                .json(
                    new ApiResponse(401, null, "Unauthorized: Creator information missing")
                );
        }

        // ✅ Handle cost logic
        let finalCost = undefined;
        if (travelCost === "Fixed Cost") {
            if (!cost) {
                return res
                    .status(200)
                    .json(new ApiResponse(400, null, "Cost is required for Fixed Cost"));
            }
            finalCost = cost;
        }

        // ✅ Handle qaTests parsing
        let parsedQaTests = [];
        if (typeof qaTests === "string") {
            try {
                parsedQaTests = JSON.parse(qaTests);
            } catch {
                parsedQaTests = [];
            }
        } else if (Array.isArray(qaTests)) {
            parsedQaTests = qaTests;
        }

        // ✅ Handle services parsing
        let parsedServices = [];
        if (typeof services === "string") {
            try {
                parsedServices = JSON.parse(services);
            } catch {
                parsedServices = [];
            }
        } else if (Array.isArray(services)) {
            // normalize serviceName + amount
            parsedServices = services.map((s) => {
                if (typeof s === "string") {
                    return { serviceName: s, amount: 0 };
                }
                return {
                    serviceName: s.serviceName?.trim() || "",
                    amount: Number(s.amount) || 0,
                };
            });
        }

        // ✅ Create manufacturer
        const manufacturer = new Manufacturer({
            name,
            email,
            phone,
            address,
            password,
            contactPersonName,
            city,
            state,
            pincode,
            branch,
            mouValidity,
            qaTests: parsedQaTests,
            services: parsedServices,
            travelCost,
            cost: finalCost,
            createdBy: creatorId,
            createdByModel: creatorModel,
            role: "Manufacturer",
        });

        await manufacturer.save();

        const populatedManufacturer = await Manufacturer.findById(manufacturer._id).populate({
            path: "createdBy",
            select: "name email phone role technicianType",
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    201,
                    populatedManufacturer,
                    "Manufacturer created successfully"
                )
            );
    } catch (error) {
        console.error("❌ Error creating manufacturer:", error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        400,
                        null,
                        `This ${duplicateField} already exists`
                    )
                );
        }

        return res
            .status(200)
            .json(new ApiResponse(500, null, error.message || "Failed to create manufacturer"));
    }
});

const getManufacturerById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const manufacturer = await Manufacturer.findById(id)
            .select("-password") // exclude password for safety
            .lean();

        if (!manufacturer) {
            throw new ApiError(404, "Manufacturer not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, manufacturer, "Manufacturer fetched successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode || 500,
                    null,
                    error.message || "Something went wrong"
                )
            );
    }
});


const editManufacturer = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        let manufacturer = await Manufacturer.findById(id);
        if (!manufacturer) {
            throw new ApiError(404, "Manufacturer not found");
        }

        // ✅ Parse qaTests safely
        if (updateData.qaTests) {
            if (typeof updateData.qaTests === "string") {
                try {
                    updateData.qaTests = JSON.parse(updateData.qaTests);
                } catch {
                    updateData.qaTests = [];
                }
            }
        }

        // ✅ Parse services safely
        if (updateData.services) {
            if (typeof updateData.services === "string") {
                try {
                    updateData.services = JSON.parse(updateData.services);
                } catch {
                    updateData.services = [];
                }
            } else if (Array.isArray(updateData.services)) {
                updateData.services = updateData.services.map((s) => {
                    if (typeof s === "string") {
                        return { serviceName: s, amount: 0 };
                    }
                    return {
                        serviceName: s.serviceName?.trim() || "",
                        amount: Number(s.amount) || 0,
                    };
                });
            }
        }

        // ✅ Update document
        manufacturer = await Manufacturer.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        return res
            .status(200)
            .json(
                new ApiResponse(200, manufacturer, "Manufacturer updated successfully")
            );
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode || 500,
                    null,
                    error.message || "Something went wrong while updating manufacturer"
                )
            );
    }
});



const deleteManufacturer = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Check if manufacturer exists
        const manufacturer = await Manufacturer.findById(id);
        if (!manufacturer) {
            throw new ApiError(404, "Manufacturer not found");
        }

        // ✅ Delete manufacturer
        await Manufacturer.findByIdAndDelete(id);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Manufacturer deleted successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode || 500,
                    null,
                    error.message || "Something went wrong while deleting manufacturer"
                )
            );
    }
};

const getAllManufacturers = async (req, res) => {
    try {
        // Fetch all manufacturers
        const manufacturers = await Manufacturer.find();

        if (!manufacturers || manufacturers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No manufacturers found",
            });
        }

        return res.status(200).json({
            success: true,
            count: manufacturers.length,
            data: manufacturers,
        });
    } catch (error) {
        console.error("Error fetching manufacturers:", error);
        return res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
};

export default { addManufacturer, getManufacturerById, editManufacturer, deleteManufacturer, getAllManufacturers }