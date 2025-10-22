import { asyncHandler } from "../../utils/AsyncHandler.js";
import Courier from "../../models/courier.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import orderModel from "../../models/order.model.js";
import mongoose from "mongoose";

 const addCourier = asyncHandler(async (req, res) => {
    console.log("📦 Payload received:", req.body);

    const { courierCompanyName, trackingId, trackingUrl, status } = req.body;
    console.log("🚀 ~ req.body:", req.body)

    // ✅ Basic validation
    if (!courierCompanyName) {
        throw new ApiError(400, "Courier company name is required");
    }

    // ✅ Identify creator
    const tokenUser = req.admin || req.user; // Admin or Staff
    const creatorId = tokenUser?._id || tokenUser?.id;
    let creatorModel = "User"; // default

    if (tokenUser?.role === "admin") {
        creatorModel = "Admin";
    }

    if (!creatorId) {
        throw new ApiError(401, "Unauthorized: Creator information missing");
    }

    // ✅ Create Courier
    const newCourier = await Courier.create({
        courierCompanyName,
        trackingId,
        trackingUrl,
        status: status || "Active",
        createdBy: creatorId,
        createdByModel: creatorModel,
    });

    // ✅ Populate createdBy for response
    const populatedCourier = await Courier.findById(newCourier._id).populate({
        path: "createdBy",
        select: "name email phone role technicianType",
    });

    res.status(201).json(new ApiResponse(201, populatedCourier, "Courier company added successfully"));
});


const getAllCompanies = asyncHandler(async (req, res) => {
    const companies = await Courier.find().sort({ createdAt: -1 });
    console.log("🚀 ~ companies:", companies)

    res.status(200).json(new ApiResponse(200, companies, "Courier companies fetched successfully"));
});

// Get single courier company by ID
const getCompanyById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const company = await Courier.findById(id);
    console.log("🚀 ~ company:", company)
    if (!company) {
        throw new ApiError(404, "Courier company not found");
    }

    res.status(200).json(new ApiResponse(200, company, "Courier company fetched successfully"));
});


const deleteCompanyById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deleted = await Courier.findByIdAndDelete(id);
    if (!deleted) {
        throw new ApiError(404, "Courier company not found");
    }

    res.status(200).json(new ApiResponse(200, deleted, "Courier company deleted successfully"));
});
const updateCourierById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { courierCompanyName, trackingId, trackingUrl, status } = req.body;

    const updatedCourier = await Courier.findByIdAndUpdate(
        id,
        {
            $set: {
                courierCompanyName,
                trackingId,
                trackingUrl,
                status,
            },
        },
        { new: true, runValidators: true }
    );

    if (!updatedCourier) {
        throw new ApiError(404, "Courier company not found");
    }

    res.status(200).json(new ApiResponse(200, updatedCourier, "Courier company updated successfully"));
});


const addByOrderId = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { courierCompanyName, trackingId, trackingUrl, status } = req.body || {};
    console.log("🚀 ~  req.body:",  req.body)

    if (!req.body) {
        return res.status(400).json({
            success: false,
            message: "Request body is missing",
        });
    }

    if (!courierCompanyName) {
        return res.status(400).json({
            success: false,
            message: "Courier company name is required",
        });
    }

    // Check if order exists
    const order = await orderModel.findById(orderId);
    if (!order) {
        return res.status(404).json({
            success: false,
            message: "Order not found",
        });
    }

    // Create courier
    const courier = await Courier.create({
        orderId, // attach orderId
        courierCompanyName,
        trackingId: trackingId || null,
        trackingUrl: trackingUrl || null,
        status: status || "active",
    });

    // Optionally, save courier reference in order
    order.courierId = courier._id;
    await order.save();

    res.status(201).json({
        success: true,
        message: "Courier successfully added to the order",
        data: courier,
    });
});


const getAllByOrderId = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        // Validate orderId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid orderId",
            });
        }

        // Fetch all courier records for this orderId
        const couriers = await Courier.find({ orderId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: couriers.length,
            couriers,
        });
    } catch (error) {
        console.error("❌ Error in getAllByOrderId:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
});

export default {
    addCourier,
    getAllCompanies,
    getCompanyById,
    deleteCompanyById,
    updateCourierById,
    addByOrderId,
    getAllByOrderId
};
