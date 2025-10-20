import Manufacturer from '../../models/manufacturer.model.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

import { asyncHandler } from '../../utils/AsyncHandler.js'

// const addManufacturer = asyncHandler(async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             phone,
//             password,
//             contactPersonName,
//             city,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests,
//             services,
//             travelCost,

//         } = req.body;
//         const tokenUser = req.admin || req.user; // Admin or Staff
//         const creatorId = tokenUser?._id || tokenUser?.id;
//         let creatorModel = "User"; // default

//         if (tokenUser?.role === "admin") {
//             creatorModel = "Admin";
//         }

//         if (!creatorId) {
//             throw new ApiError(401, "Unauthorized: Creator information missing");
//         }
//         const manufacturer = new Manufacturer({
//             name,
//             email,
//             phone,
//             password, // make sure you hash password if required
//             city,
//             contactPersonName,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests,
//             services,
//             travelCost,
//             createdBy: creatorId,
//             createdByModel: creatorModel,
//             role: "Manufacturer", // optional if you want to distinguish
//         });

//         await manufacturer.save();

//         res.status(201).json({
//             success: true,
//             message: "Manufacturer created successfully",
//             data: manufacturer,
//         });
//     } catch (error) {
//         console.error("Error creating manufacturer:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create manufacturer",
//             error: error.message,
//         });
//     }
// });

// const addManufacturer = asyncHandler(async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             phone,
//             password,
//             contactPersonName,
//             city,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests = [],
//             services = [],
//             travelCost,
//         } = req.body;

//         // ✅ Basic validation
//         if (!name || !email || !phone) {
//             throw new ApiError(400, "Name, phone, and email are required");
//         }

//         // ✅ Merge fixed + provided QA tests without duplicates
//         const mergedQaTests = [...FIXED_QA_TESTS, ...qaTests].reduce((acc, curr) => {
//             if (!acc.find(test => test.testName.toLowerCase() === curr.testName.toLowerCase())) {
//                 acc.push(curr);
//             }
//             return acc;
//         }, []);

//         // ✅ Identify creator
//         const tokenUser = req.admin || req.user; // Admin or Staff
//         const creatorId = tokenUser?._id || tokenUser?.id;
//         let creatorModel = "User"; // default

//         if (tokenUser?.role === "admin") {
//             creatorModel = "Admin";
//         }

//         if (!creatorId) {
//             throw new ApiError(401, "Unauthorized: Creator information missing");
//         }

//         // ✅ Create Manufacturer
//         const manufacturer = new Manufacturer({
//             name,
//             email,
//             phone,
//             password, // hash if needed
//             contactPersonName,
//             city,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests: mergedQaTests,
//             services,
//             travelCost,
//             role: "Manufacturer", // optional
//             createdBy: creatorId,
//             createdByModel: creatorModel,
//         });

//         await manufacturer.save();

//         // ✅ Populate createdBy for response
//         const populatedManufacturer = await Manufacturer.findById(manufacturer._id).populate({
//             path: "createdBy",
//             select: "name email phone role technicianType",
//         });

//         res.status(201).json(new ApiResponse(201, populatedManufacturer, "Manufacturer created successfully"));
//     } catch (error) {
//         console.error("❌ Manufacturer creation error:", error);
//         throw new ApiError(error.statusCode || 500, error.message || "Failed to create manufacturer");
//     }
// });




// export const addManufacturer = asyncHandler(async (req, res) => {
//     try {
//         const {
//             name,
//             email,
//             phone,
//             password,
//             contactPersonName,
//             city,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests = [],
//             services = [],
//             travelCost,
//             cost, // ✅ optional
//         } = req.body;

//         // ✅ Basic validation
//         if (!name || !email || !phone) {
//             throw new ApiError(400, "Name, Email, and Phone are required");
//         }

//         // ✅ Identify creator (Admin or Staff)
//         const tokenUser = req.admin || req.user;
//         const creatorId = tokenUser?._id || tokenUser?.id;
//         let creatorModel = "User";

//         if (tokenUser?.role === "admin") {
//             creatorModel = "Admin";
//         }

//         if (!creatorId) {
//             throw new ApiError(401, "Unauthorized: Creator information missing");
//         }

//         // ✅ Handle cost logic
//         let finalCost = undefined;
//         if (travelCost === "Fixed Cost") {
//             if (!cost) {
//                 throw new ApiError(400, "Cost is required when travel cost type is Fixed Cost");
//             }
//             finalCost = cost;
//         }

//         // ✅ Create manufacturer
//         const manufacturer = new Manufacturer({
//             name,
//             email,
//             phone,
//             password, // ⚠️ Hash before saving if used for auth
//             contactPersonName,
//             city,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests,
//             services,
//             travelCost,
//             cost: finalCost, // ✅ Only added when "Fixed Cost"
//             createdBy: creatorId,
//             createdByModel: creatorModel,
//             role: "Manufacturer",
//         });

//         await manufacturer.save();

//         // ✅ Populate createdBy for cleaner response
//         const populatedManufacturer = await Manufacturer.findById(manufacturer._id).populate({
//             path: "createdBy",
//             select: "name email phone role technicianType",
//         });

//         res
//             .status(201)
//             .json(new ApiResponse(201, populatedManufacturer, "Manufacturer created successfully"));
//     } catch (error) {
//         console.error("❌ Error creating manufacturer:", error);
//         throw new ApiError(500, error.message || "Failed to create manufacturer");
//     }
// });


export const addManufacturer = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            address, // ✅ make sure to include address here
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
            cost, // ✅ optional
        } = req.body;

        console.log("🚀 ~ req.body:", req.body);

        // ✅ Basic validation
        if (!name || !email || !phone) {
            throw new ApiError(400, "Name, Email, and Phone are required");
        }

        // ✅ Identify creator (Admin or Staff)
        const tokenUser = req.admin || req.user;
        const creatorId = tokenUser?._id || tokenUser?.id;
        let creatorModel = "User";

        if (tokenUser?.role === "admin") {
            creatorModel = "Admin";
        }

        if (!creatorId) {
            throw new ApiError(401, "Unauthorized: Creator information missing");
        }

        // ✅ Handle cost logic
        let finalCost = undefined;
        if (travelCost === "Fixed Cost") {
            if (!cost) {
                throw new ApiError(400, "Cost is required when travel cost type is Fixed Cost");
            }
            finalCost = cost;
        }

        // ✅ Create manufacturer
        const manufacturer = new Manufacturer({
            name,
            email,
            phone,
            address, // ✅ added
            password, // ⚠️ make sure you hash it before saving if used for login
            contactPersonName,
            city,
            state,
            pincode,
            branch,
            mouValidity,
            qaTests,
            services,
            travelCost,
            cost: finalCost, // ✅ only if Fixed Cost
            createdBy: creatorId,
            createdByModel: creatorModel,
            role: "Manufacturer",
        });

        await manufacturer.save();

        // ✅ Populate creator details for response clarity
        const populatedManufacturer = await Manufacturer.findById(manufacturer._id).populate({
            path: "createdBy",
            select: "name email phone role technicianType",
        });

        res.status(201).json(
            new ApiResponse(201, populatedManufacturer, "Manufacturer created successfully")
        );
    } catch (error) {
        console.error("❌ Error creating manufacturer:", error);
        throw new ApiError(500, error.message || "Failed to create manufacturer");
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
        const updateData = req.body;

        // ✅ Check if manufacturer exists
        let manufacturer = await Manufacturer.findById(id);
        if (!manufacturer) {
            throw new ApiError(404, "Manufacturer not found");
        }

        // ✅ Update manufacturer
        manufacturer = await Manufacturer.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password"); // exclude sensitive fields

        return res
            .status(200)
            .json(new ApiResponse(200, manufacturer, "Manufacturer updated successfully"));
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