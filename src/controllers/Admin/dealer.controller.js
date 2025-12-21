import mongoose from "mongoose";
import Dealer from "../../models/dealer.model.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js"
import { ApiError } from "../../utils/ApiError.js"
// const FIXED_QA_TESTS = [
//     { testName: "FIXED X RAY", price: 3500 },
//     { testName: "MOBILE X RAY", price: 2500 },
//     { testName: "C ARM", price: 3000 },
//     { testName: "MAMMOGRAPH", price: 4000 },
//     { testName: "CATH LAB", price: 5000 },
//     { testName: "CT SCAN", price: 600 },
// ];

// export const createDealer = asyncHandler(async (req, res) => {
//     try {
//         const {
//             name,
//             phone,
//             email,
//             address,
//             city,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests = []
//         } = req.body;

//         // ✅ Basic validation
//         if (!name || !phone || !email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Name, phone, and email are required",
//             });
//         }

//         // ✅ Merge fixed + provided tests without duplicates
//         const mergedQaTests = [
//             ...FIXED_QA_TESTS,
//             ...qaTests
//         ].reduce((acc, curr) => {
//             if (!acc.find(test => test.testName.toLowerCase() === curr.testName.toLowerCase())) {
//                 acc.push(curr);
//             }
//             return acc;
//         }, []);

//         // ✅ Create dealer
//         const dealer = new Dealer({
//             name,
//             phone,
//             email,
//             address,
//             city,
//             state,
//             pincode,
//             branch,
//             mouValidity,
//             qaTests: mergedQaTests,
//         });

//         await dealer.save();

//         res.status(201).json({
//             success: true,
//             message: "Dealer created successfully",
//             dealer,
//         });
//     } catch (error) {
//         console.error("❌ Dealer creation error:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Failed to create dealer",
//         });
//     }
// });
export const createDealer = asyncHandler(async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            branch,
            mouValidity,
            qaTests = []
        } = req.body;

        // ✅ Basic validation
        if (!name || !phone || !email) {
            return res
                .status(200)
                .json(new ApiResponse(400, null, "Name, phone, and email are required"));
        }

        // ✅ Check for existing phone or email
        const existingDealer = await Dealer.findOne({
            $or: [{ phone }, { email }],
        });

        if (existingDealer) {
            if (existingDealer.phone === phone) {
                return res
                    .status(200)
                    .json(new ApiResponse(400, null, "Dealer with this phone number already exists"));
            }
            if (existingDealer.email === email) {
                return res
                    .status(200)
                    .json(new ApiResponse(400, null, "Dealer with this email already exists"));
            }
        }

        // ✅ Identify creator (Admin or Staff)
        const tokenUser = req.admin || req.user;
        const creatorId = tokenUser?.id || tokenUser?._id;
        let creatorModel = "User";

        if (tokenUser?.role === "admin") {
            creatorModel = "Admin";
        }

        if (!creatorId) {
            return res
                .status(200)
                .json(new ApiResponse(401, null, "Unauthorized: Creator information missing"));
        }

        // ✅ Create Dealer
        const dealer = new Dealer({
            name,
            phone,
            email,
            address,
            city,
            state,
            pincode,
            branch,
            mouValidity,
            qaTests,
            createdBy: creatorId,
            createdByModel: creatorModel,
        });

        await dealer.save();

        // ✅ Populate createdBy for response
        const populatedDealer = await Dealer.findById(dealer._id).populate({
            path: "createdBy",
            select: "name email address phone role technicianType",
        });

        return res
            .status(200)
            .json(new ApiResponse(201, populatedDealer, "Dealer created successfully"));
    } catch (error) {
        console.error("❌ Dealer creation error:", error);
        
        // Check for MongoDB duplicate key error (E11000)
        if (error.code === 11000 || error.name === 'MongoServerError') {
            const duplicateKeyError = error.code === 11000 ? error : error.errorResponse || error;
            const keyPattern = duplicateKeyError.keyPattern || {};
            const keyValue = duplicateKeyError.keyValue || {};
            
            // Determine which field is duplicate
            let duplicateField = '';
            let duplicateValue = '';
            
            if (keyPattern.email) {
                duplicateField = 'email';
                duplicateValue = keyValue.email || '';
            } else if (keyPattern.phone) {
                duplicateField = 'phone';
                duplicateValue = keyValue.phone || '';
            } else {
                // Fallback: try to extract from error message
                const errorMsg = error.message || '';
                if (errorMsg.includes('email')) {
                    duplicateField = 'email';
                } else if (errorMsg.includes('phone')) {
                    duplicateField = 'phone';
                }
            }
            
            const fieldLabel = duplicateField === 'email' ? 'Email' : duplicateField === 'phone' ? 'Phone number' : 'Field';
            const errorMessage = duplicateValue 
                ? `${fieldLabel} "${duplicateValue}" already exists. Please use a different ${fieldLabel.toLowerCase()}.`
                : `${fieldLabel} already exists. Please use a different ${fieldLabel.toLowerCase()}.`;
            
            return res
                .status(200)
                .json(new ApiResponse(400, null, errorMessage));
        }
        
        // Generic error for other cases
        return res
            .status(200)
            .json(new ApiResponse(500, null, error.message || "Failed to create dealer"));
    }
});


const getById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // validate ObjectId
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid dealer ID" });
        }

        // find dealer by id
        const dealer = await Dealer.findById(id);
        console.log("🚀 ~ dealer:", dealer)

        if (!dealer) {
            return res.status(404).json({ message: "Dealer not found" });
        }

        res.status(200).json({
            success: true,
            data: dealer,
        });
    } catch (error) {
        console.error("Error fetching dealer:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
const getAll = asyncHandler(async (req, res) => {
    try {
        const dealers = await Dealer.find()  .sort({ createdAt: -1 });; // fetch all dealers

        res.status(200).json({
            success: true,
            count: dealers.length,
            dealers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch dealers",
        });
    }
});


// ✅ Delete dealer by ID
const deleteById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const dealer = await Dealer.findById(id);
        if (!dealer) {
            throw new ApiError(404, "Dealer not found");
        }

        await Dealer.findByIdAndDelete(id);

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Dealer deleted successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode || 500,
                    null,
                    error.message || "Something went wrong while deleting dealer"
                )
            );
    }
});

// ✅ Edit dealer by ID
const editById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const dealer = await Dealer.findById(id);
        if (!dealer) {
            throw new ApiError(404, "Dealer not found");
        }

        const updatedDealer = await Dealer.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, updatedDealer, "Dealer updated successfully"));
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    error.statusCode || 500,
                    null,
                    error.message || "Something went wrong while updating dealer"
                )
            );
    }
});



export default { createDealer, getAll, getById, editById, deleteById }