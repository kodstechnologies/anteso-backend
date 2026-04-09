import mongoose from "mongoose";
import orderModel from "../../models/order.model.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Services from "../../models/Services.js";
import User from "../../models/user.model.js";
import { generateULRReportNumber, generateQATestReportNumber, getNextSequence } from "../../utils/ReportNumberGenerator.js";
import Employee from "../../models/technician.model.js";
import Client from "../../models/client.model.js";
import Hospital from "../../models/hospital.model.js";
import { uploadToS3 } from "../../utils/s3Upload.js";
import Payment from "../../models/payment.model.js";
import { getFileUrl, getMultipleFileUrls } from "../../utils/s3Fetch.js";
import AdditionalService from "../../models/additionalService.model.js";
import { CustomMachine } from "../../models/customeMachine.model.js";
import QATest from "../../models/QATest.model.js";
import Elora from "../../models/elora.model.js";
import Attendance from "../../models/attendanceSchema.model.js"
import Invoice from "../../models/invoice.model.js";

// const getAllOrders = asyncHandler(async (req, res) => {
//     try {
//         const orders = await orderModel.find({}).sort({ createdAt: -1 });
//         console.log("🚀 ~ orders:", orders)

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: "No orders found" });
//         }
//         res.status(200).json({
//             message: "Orders fetched successfully",
//             count: orders.length,
//             orders
//         });
//     } catch (error) {
//         console.error("Error in getAllOrders:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });



// const getAllOrders = asyncHandler(async (req, res) => {
//     try {
//         let orders = await orderModel.find({}).sort({ createdAt: -1 });

//         // Fetch leadOwner names for all orders
//         // orders = await Promise.all(
//         //     orders.map(async (order) => {
//         //         let leadOwnerName = order.leadOwner;

//         //         // Try to find a user with this ID or string
//         //         const user = await User.findById(order.leadOwner).select('name');
//         //         console.log("🚀 ~ user:", user)
//         //         if (user) {
//         //             leadOwnerName = user.name;
//         //         }

//         //         return {
//         //             ...order.toObject(),
//         //             leadOwner: leadOwnerName
//         //         };
//         //     })
//         // );
//         orders = await Promise.all(
//             orders.map(async (order) => {
//                 let leadOwnerName = order.leadOwner;

//                 if (mongoose.Types.ObjectId.isValid(order.leadOwner)) {
//                     const user = await User.findById(order.leadOwner).select("name");
//                     if (user) leadOwnerName = user.name;
//                 }

//                 return {
//                     ...order.toObject(),
//                     leadOwner: leadOwnerName,
//                 };
//             })
//         );


//         if (!orders || orders.length === 0) {
//             return res.status(200).json(new ApiResponse(200, [], "No Orders found"));
//         }

//         res.status(200).json({
//             message: "Orders fetched successfully",
//             count: orders.length,
//             orders
//         });
//     } catch (error) {
//         console.error("Error in getAllOrders:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

// const getAllOrders = asyncHandler(async (req, res) => {
//     try {
//         let orders = await orderModel.find({}).sort({ createdAt: -1 });

//         // ✅ Fetch leadOwner name & type (fallback to customer if leadOwner missing)
//         orders = await Promise.all(
//             orders.map(async (order) => {
//                 let leadOwnerName = "N/A";
//                 let leadOwnerType = "N/A";

//                 // 🔹 Try Lead Owner first
//                 if (order.leadOwner && mongoose.Types.ObjectId.isValid(order.leadOwner)) {
//                     const user = await User.findById(order.leadOwner).select("name role");
//                     if (user) {
//                         leadOwnerName = user.name;
//                         leadOwnerType = user.role;
//                     }
//                 }

//                 // 🔹 If Lead Owner not found → try Customer
//                 if (
//                     (leadOwnerName === "N/A" || leadOwnerType === "N/A") &&
//                     order.customer &&
//                     mongoose.Types.ObjectId.isValid(order.customer)
//                 ) {
//                     const customer = await User.findById(order.customer).select("name role");
//                     if (customer) {
//                         leadOwnerName = customer.name;
//                         leadOwnerType = customer.role;
//                     }
//                 }

//                 return {
//                     ...order.toObject(),
//                     createdAt: order.createdAt,
//                     leadOwner: leadOwnerName,
//                     leadOwnerType,
//                 };
//             })
//         );

//         if (!orders || orders.length === 0) {
//             return res.status(200).json(new ApiResponse(200, [], "No Orders found"));
//         }

//         res.status(200).json({
//             message: "Orders fetched successfully",
//             count: orders.length,
//             orders,
//         });
//     } catch (error) {
//         console.error("Error in getAllOrders:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

const getAllOrders = asyncHandler(async (req, res) => {
    try {
        let orders = await orderModel
            .find({})
            .populate({
                path: "services",
                select: "procNoOrPoNo procExpiryDate machineType partyCodeOrSysId"
            })
            .sort({ createdAt: -1 });

        orders = await Promise.all(
            orders.map(async (order) => {
                let leadOwnerName = "N/A";
                let leadOwnerType = "N/A";

                if (order.leadOwner && mongoose.Types.ObjectId.isValid(order.leadOwner)) {
                    const user = await User.findById(order.leadOwner).select("name role");
                    if (user) {
                        leadOwnerName = user.name;
                        leadOwnerType = user.role;
                    }
                }

                if (
                    (leadOwnerName === "N/A" || leadOwnerType === "N/A") &&
                    order.customer &&
                    mongoose.Types.ObjectId.isValid(order.customer)
                ) {
                    const customer = await User.findById(order.customer).select("name role");
                    if (customer) {
                        leadOwnerName = customer.name;
                        leadOwnerType = customer.role;
                    }
                }

                return {
                    ...order.toObject(),
                    createdAt: order.createdAt,
                    leadOwner: leadOwnerName,
                    leadOwnerType,
                    partyCodeOrSysId: order.services?.[0]?.partyCodeOrSysId || null,
                    // ✅ Flatten first service (or handle multiple)
                    procNoOrPoNo: order.services?.[0]?.procNoOrPoNo || null,
                    procExpiryDate: order.services?.[0]?.procExpiryDate || null,
                };
            })
        );

        res.status(200).json({
            message: "Orders fetched successfully",
            count: orders.length,
            orders,
        });

    } catch (error) {
        console.error("Error in getAllOrders:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


const getBasicDetailsByOrderId = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log("🚀 ~ orderId:", orderId)

        // Validate orderId
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid or missing order ID." });
        }

        // Fetch order with only basic details needed
        const order = await orderModel.findById(orderId).select(
            'srfNumber leadOwner hospitalName fullAddress city district state pinCode branchName contactPersonName emailAddress contactNumber designation'
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({
            message: 'Order basic details fetched successfully',
            data: order
        });

    } catch (error) {
        console.error("Error in getBasicDetailsByOrderId:", error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

const updateBasicDetailsByOrderId = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        const updateData = req.body;

        console.log("📝 Updating order:", orderId, "with:", updateData);

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid or missing order ID." });
        }

        // Fields we allow to update
        const allowedFields = [
            'hospitalName',
            'fullAddress',
            'city',
            // 'district',
            'state',
            'pinCode',
            // 'branchName',
            'contactPersonName',
            'emailAddress',
            'contactNumber',
            'designation'
        ];

        // Filter only allowed fields
        const filteredUpdate = {};
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined && updateData[field] !== '') {
                filteredUpdate[field] = updateData[field];
            }
        });

        if (Object.keys(filteredUpdate).length === 0) {
            return res.status(400).json({ message: "No valid fields provided for update" });
        }

        // 1. Find the order
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const oldEmail = order.emailAddress;
        const oldPhone = order.contactNumber;

        const newEmail = filteredUpdate.emailAddress || oldEmail;
        const newPhone = filteredUpdate.contactNumber || oldPhone;

        // 2. Find or prepare client
        let client = await Client.findOne({
            $or: [
                { email: newEmail },
                { phone: newPhone }
            ]
        });

        if (client) {
            // Link hospital if not already linked
            if (order.hospital && !client.hospitals.includes(order.hospital)) {
                client.hospitals.push(order.hospital);
            }

            // Update client (person-level info)
            const clientUpdate = {};
            if (filteredUpdate.contactPersonName) clientUpdate.name = filteredUpdate.contactPersonName;
            if (newEmail !== client.email) clientUpdate.email = newEmail;
            if (newPhone !== client.phone) clientUpdate.phone = newPhone;
            if (filteredUpdate.fullAddress) clientUpdate.address = filteredUpdate.fullAddress;

            if (Object.keys(clientUpdate).length > 0) {
                await Client.findByIdAndUpdate(client._id, clientUpdate, { new: true, runValidators: true });
            }
        } else if (newEmail && newPhone) {
            // Create new client if none found
            client = await Client.create({
                name: filteredUpdate.contactPersonName || order.contactPersonName || "Unknown Contact",
                email: newEmail,
                phone: newPhone,
                address: filteredUpdate.fullAddress || order.fullAddress || "",
                hospitals: order.hospital ? [order.hospital] : [],
            });
        }

        // 3. Update Hospital (hospital-level info)
        if (order.hospital) {
            const hospitalUpdate = {
                name: filteredUpdate.hospitalName,
                address: filteredUpdate.fullAddress,
                city: filteredUpdate.city,
                // district: filteredUpdate.district,
                state: filteredUpdate.state,
                pinCode: filteredUpdate.pinCode,
                // branch: filteredUpdate.branchName,
                phone: filteredUpdate.contactNumber,
                email: filteredUpdate.emailAddress,

            };

            Object.keys(hospitalUpdate).forEach(key =>
                hospitalUpdate[key] === undefined && delete hospitalUpdate[key]
            );

            if (Object.keys(hospitalUpdate).length > 0) {
                await Hospital.findByIdAndUpdate(order.hospital, hospitalUpdate, { new: true, runValidators: true });
            }
        }

        // 4. Update the Order itself (keep snapshot)
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { $set: filteredUpdate },
            { new: true, runValidators: true }
        ).select(
            'srfNumber leadOwner hospitalName fullAddress city district state pinCode branchName ' +
            'contactPersonName emailAddress contactNumber designation customer hospital'
        );

        return res.status(200).json({
            message: "Basic details updated successfully",
            data: updatedOrder
        });

    } catch (error) {
        console.error("Error in updateBasicDetailsByOrderId:", error);
        res.status(500).json({
            message: "Server Error",
            error: error.message || "Internal server error"
        });
    }
});

const getAdditionalServicesByOrderId = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // ✅ Populate 'additionalServices' including updatedBy and assignedStaff details
        const order = await orderModel
            .findById(orderId)
            .populate({
                path: "additionalServices",
                select: "name description remark status totalAmount report updatedBy updatedByModel assignedStaff assignedAt",
                populate: [
                    {
                        path: "updatedBy",
                        select: "name email phone role technicianType", // ✅ include readable user info
                    },
                    {
                        path: "assignedStaff",
                        select: "name email phone role technicianType profilePicture",
                    }
                ],
            })
            .select("additionalServices specialInstructions");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            additionalServices: order.additionalServices || [],
            specialInstructions: order.specialInstructions || "",
        });
    } catch (error) {
        console.error("❌ Error fetching additional services:", error);
        res.status(500).json({ message: error.message || "Something went wrong" });
    }
});


const getAllServicesByOrderId = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        // Validate orderId
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: 'Invalid order ID' });
        }

        // Fetch only the services field of the order
        const order = await orderModel
            .findById(orderId)
            .select('services')
            .populate({
                path: 'services',
                populate: [
                    {
                        path: 'workTypeDetails.engineer',
                        model: 'Employee',
                    },
                    {
                        path: 'workTypeDetails.officeStaff',
                        model: 'Employee',
                    }
                ]
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        return res.status(200).json({ services: order.services });
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

// const getServicesByDetails = asyncHandler(async (req, res) => {
//     try {
//     } catch (error) {
//     }
// }) 


//changed after model change
// const getMachineDetailsByOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         const order = await orderModel.findById(orderId)
//             .populate({
//                 path: "services",
//                 // populate: [
//                 //     { path: "workTypeDetails.engineer", model: "Employee" },
//                 //     { path: "workTypeDetails.officeStaff", model: "Employee" }
//                 // ]
//             });

//         if (!order) {
//             throw new ApiError(404, "Order not found");
//         }
//         console.log(JSON.stringify(order.services, null, 2));

//         console.log("🚀 ~ order.services:", order.services)
//         return res
//             .status(200)
//             .json(new ApiResponse(200, order.services, "Machine details fetched"));
//     } catch (error) {
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json(error);
//         }
//         return res
//             .status(500)
//             .json(new ApiError(500, "Internal Server Error", [], error.stack));
//     }
// });



// const getMachineDetailsByOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         const order = await orderModel.findById(orderId)
//             .populate({
//                 path: "services",
//                 populate: {
//                     path: "workTypeDetails.QAtest",
//                     model: "QATest"
//                 }
//             });

//         if (!order) {
//             throw new ApiError(404, "Order not found");
//         }

//         console.log("🚀 ~ order.services:", JSON.stringify(order.services, null, 2));

//         return res
//             .status(200)
//             .json(new ApiResponse(200, order.services, "Machine details fetched"));
//     } catch (error) {
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json(error);
//         }
//         return res
//             .status(500)
//             .json(new ApiError(500, "Internal Server Error", [], error.stack));
//     }
// });

// const getMachineDetailsByOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         // Validate ObjectId
//         if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
//             throw new ApiError(400, "Invalid orderId");
//         }

//         // Populate all required fields including assignedAt
//         const order = await orderModel.findById(orderId)
//             .populate({
//                 path: "services",
//                 populate: [
//                     { path: "workTypeDetails.QAtest", model: "QATest" },
//                     {
//                         path: "workTypeDetails.elora",
//                         model: "Elora",
//                         populate: { path: "officeStaff", model: "Employee" }
//                     }
//                 ]
//             })
//             .lean(); // <-- ensure assignedAt is included RAW

//         if (!order) {
//             throw new ApiError(404, "Order not found");
//         }

//         // 🔥 Ensure assignedAt is included in final output
//         const servicesWithAssignedAt = order.services.map(service => ({
//             ...service,
//             workTypeDetails: service.workTypeDetails.map(w => ({
//                 ...w,
//                 assignedAt: w.assignedAt || null, // ensure assignedAt always visible
//             }))
//         }));

//         console.log("🚀 ~ Final Output with assignedAt:", JSON.stringify(servicesWithAssignedAt, null, 2));

//         return res
//             .status(200)
//             .json(new ApiResponse(200, servicesWithAssignedAt, "Machine details fetched successfully"));
//     } catch (error) {
//         console.error("❌ Error fetching machine details:", error);
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json(error);
//         }
//         return res
//             .status(500)
//             .json(new ApiError(500, "Internal Server Error", [], error.stack));
//     }
// });

// const getMachineDetailsByOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
//             throw new ApiError(400, "Invalid orderId");
//         }

//         // Populate services → workTypeDetails → QATest + Elora
//         const order = await orderModel.findById(orderId)
//             .populate({
//                 path: "services",
//                 populate: [
//                     { path: "workTypeDetails.QAtest", model: "QATest" },
//                     {
//                         path: "workTypeDetails.elora",
//                         model: "Elora",
//                         populate: { path: "officeStaff", model: "Employee" }
//                     }
//                 ]
//             })
//             .lean();

//         if (!order) {
//             throw new ApiError(404, "Order not found");
//         }

//         // 🔥 Ensure assignedAt + completedAt are included
//         const servicesWithTimeFields = order.services.map(service => ({
//             ...service,
//             workTypeDetails: service.workTypeDetails.map(w => ({
//                 ...w,
//                 assignedAt: w.assignedAt || null,     // existing
//                 completedAt: w.completedAt || null,   // ⭐ newly added
//             }))
//         }));

//         console.log("🚀 Final Output with assignedAt + completedAt:",
//             JSON.stringify(servicesWithTimeFields, null, 2)
//         );

//         return res.status(200).json(
//             new ApiResponse(200, servicesWithTimeFields, "Machine details fetched successfully")
//         );

//     } catch (error) {
//         console.error("❌ Error fetching machine details:", error);
//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json(error);
//         }
//         return res.status(500).json(
//             new ApiError(500, "Internal Server Error", [], error.stack)
//         );
//     }
// });



// const getMachineDetailsByOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
//             throw new ApiError(400, "Invalid orderId");
//         }

//         const order = await orderModel.findById(orderId)
//             .populate({
//                 path: "services",
//                 populate: [
//                     {
//                         path: "workTypeDetails.QAtest",
//                         model: "QATest",
//                         select: "reportULRNumber qaTestReportNumber reportStatus report remark assignedAt qatestSubmittedAt officeStaff", // ✅ Include qatestSubmittedAt
//                         populate: {
//                             path: "officeStaff",
//                             model: "Employee",
//                             select: "name email phone"
//                         }
//                     },
//                     {
//                         path: "workTypeDetails.elora",
//                         model: "Elora",
//                         populate: {
//                             path: "officeStaff",
//                             model: "Employee",
//                             select: "name email phone"
//                         }
//                     },
//                     {
//                         path: "workTypeDetails.engineer",
//                         model: "Employee",
//                         select: "name email phone"
//                     }
//                 ]
//             })
//             .lean();

//         if (!order) {
//             throw new ApiError(404, "Order not found");
//         }

//         // ⭐ NO MORE findById(h.updatedBy)
//         const services = order.services.map(service => {
//             const updatedWorkTypes = service.workTypeDetails.map(w => {
//                 const populatedHistory = (w.statusHistory || []).map(h => ({
//                     oldStatus: h.oldStatus,
//                     newStatus: h.newStatus,
//                     updatedAt: h.updatedAt,
//                     updatedBy: h.updatedBy || { _id: null, name: "System", role: "system" }
//                 }));

//                 return {
//                     ...w,
//                     assignedAt: w.assignedAt || null,
//                     completedAt: w.completedAt || null,
//                     statusHistory: populatedHistory
//                 };
//             });

//             return {
//                 ...service,
//                 workTypeDetails: updatedWorkTypes
//             };
//         });

//         return res.status(200).json(
//             new ApiResponse(200, services, "Machine details fetched successfully")
//         );

//     } catch (error) {
//         console.error("❌ Error fetching machine details:", error);

//         if (error instanceof ApiError) {
//             return res.status(error.statusCode).json(error);
//         }

//         return res.status(500).json(
//             new ApiError(500, "Internal Server Error", [], error.stack)
//         );
//     }
// });


const getMachineDetailsByOrderId = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            throw new ApiError(400, "Invalid orderId");
        }

        const order = await orderModel.findById(orderId)
            .populate({
                path: "additionalServices",
                select: "name description totalAmount"
            })
            .populate({
                path: "services",
                select: "machineType equipmentNo machineModel quantity serialNumber remark workOrderCopy partyCodeOrSysId procNoOrPoNo procExpiryDate workTypeDetails price", // ✅ Include the new fields
                populate: [
                    {
                        path: "workTypeDetails.QAtest",
                        model: "QATest",
                        select: "reportULRNumber qaTestReportNumber reportStatus report remark assignedAt qatestSubmittedAt officeStaff",
                        populate: {
                            path: "officeStaff",
                            model: "Employee",
                            select: "name email phone"
                        }
                    },
                    {
                        path: "workTypeDetails.elora",
                        model: "Elora",
                        populate: {
                            path: "officeStaff",
                            model: "Employee",
                            select: "name email phone"
                        }
                    },
                    {
                        path: "workTypeDetails.engineer",
                        model: "Employee",
                        select: "name email phone"
                    }
                ]
            })
            .lean();

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        // Format the response with all service details including the new fields
        const services = order.services.map(service => {
            const updatedWorkTypes = service.workTypeDetails.map(w => {
                const populatedHistory = (w.statusHistory || []).map(h => ({
                    oldStatus: h.oldStatus,
                    newStatus: h.newStatus,
                    updatedAt: h.updatedAt,
                    updatedBy: h.updatedBy || { _id: null, name: "System", role: "system" }
                }));

                return {
                    ...w,
                    assignedAt: w.assignedAt || null,
                    completedAt: w.completedAt || null,
                    statusHistory: populatedHistory
                };
            });

            return {
                _id: service._id,
                machineType: service.machineType,
                equipmentNo: service.equipmentNo || null,
                machineModel: service.machineModel || null,
                quantity: service.quantity || 1,
                serialNumber: service.serialNumber || null,
                remark: service.remark || null,

                // ✅ NEW FIELDS - Display these details
                workOrderCopy: service.workOrderCopy || null, // URL string or null
                partyCodeOrSysId: service.partyCodeOrSysId || null,
                procNoOrPoNo: service.procNoOrPoNo || null,
                procExpiryDate: service.procExpiryDate || null,

                // Format date if it exists
                formattedProcExpiryDate: service.procExpiryDate
                    ? new Date(service.procExpiryDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    })
                    : null,

                price: service.price || 0, // ✅ Include price

                workTypeDetails: updatedWorkTypes,
                createdAt: service.createdAt,
                updatedAt: service.updatedAt
            };
        });

        return res.status(200).json(
            new ApiResponse(200, { services, additionalServices: order.additionalServices, leadOwner: order.leadOwner }, "Machine details fetched successfully")
        );

    } catch (error) {
        console.error("❌ Error fetching machine details:", error);

        if (error instanceof ApiError) {
            return res.status(error.statusCode).json(error);
        }

        return res.status(500).json(
            new ApiError(500, "Internal Server Error", [], error.stack)
        );
    }
});

const addMachineToOrder = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log("🚀 ~ orderId:", orderId)
        const {
            machineType,
            equipmentId,
            machineModel,
            workTypes,       // new: JSON array of { workType, price }
            workType,        // legacy fallback
            partyCodeOrSysId,
            procNoOrPoNo,
            procExpiryDate,
            price,           // legacy fallback
            fromOthers,
        } = req.body;

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid or missing order ID." });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const fromOthersFlag =
            fromOthers === true || fromOthers === "true" || fromOthers === "1";

        if (fromOthersFlag && machineType && String(machineType).trim() && machineType !== "Others") {
            const name = String(machineType).trim();
            const code = name
                .replace(/[^a-zA-Z0-9]+/g, "_")
                .replace(/^_|_$/g, "")
                .toUpperCase()
                .slice(0, 64) || "CUSTOM";
            await CustomMachine.updateOne(
                { name },
                { $setOnInsert: { name, code } },
                { upsert: true }
            );
        }

        let workOrderCopyUrl = "";
        if (req.file) {
            const uploaded = await uploadToS3(req.file);
            workOrderCopyUrl = uploaded.url;
        }

        // Parse workTypes
        let workTypeDetails = [];
        let finalTotalPrice = 0;

        if (workTypes) {
            // Case 1: workTypes is sent as an array of { workType, price } (from previous version or other clients)
            try {
                const parsedWorkTypes = typeof workTypes === 'string' ? JSON.parse(workTypes) : workTypes;
                workTypeDetails = Array.isArray(parsedWorkTypes) ? parsedWorkTypes.map(item => ({
                    workType: typeof item === 'string' ? item : item.workType,
                    price: typeof item === 'string' ? 0 : (item.price || 0),
                    status: 'pending'
                })) : [];

                // If it's a simple array of strings, use the top-level price
                if (Array.isArray(parsedWorkTypes) && typeof parsedWorkTypes[0] === 'string') {
                    finalTotalPrice = Number(price) || 0;
                } else {
                    finalTotalPrice = workTypeDetails.reduce((sum, wt) => sum + (wt.price || 0), 0) || Number(price) || 0;
                }
            } catch (e) {
                workTypeDetails = [];
            }
        }

        // Fallback or Case 2: workType is sent as an array of strings or single string (from new simple UI)
        if (workTypeDetails.length === 0 && workType) {
            try {
                const parsedTypes = typeof workType === 'string' && workType.startsWith('[')
                    ? JSON.parse(workType)
                    : (Array.isArray(workType) ? workType : [workType]);

                workTypeDetails = parsedTypes.map(wt => ({
                    workType: wt,
                    price: 0,
                    status: 'pending'
                }));
                finalTotalPrice = Number(price) || 0;
            } catch (e) {
                workTypeDetails = [{ workType, price: 0, status: 'pending' }];
                finalTotalPrice = Number(price) || 0;
            }
        }

        const newService = await Services.create({
            machineType,
            equipmentNo: equipmentId,
            machineModel,
            quantity: 1,
            workOrderCopy: workOrderCopyUrl,
            partyCodeOrSysId,
            procNoOrPoNo,
            procExpiryDate: procExpiryDate ? new Date(procExpiryDate) : null,
            workTypeDetails,
            price: finalTotalPrice
        });

        order.services.push(newService._id);

        // order.machineType = machineType;
        // order.equipmentId = equipmentId;
        // order.machineModel = machineModel;
        // order.workType = parsedWorkTypes.join(', ');
        // order.partyCodeOrSysId = partyCodeOrSysId;
        // order.procNoOrPoNo = procNoOrPoNo;
        // order.procExpiryDate = procExpiryDate ? new Date(procExpiryDate) : null;
        // if (workOrderCopyUrl) order.workOrderCopy = workOrderCopyUrl;

        await order.save();

        return res.status(201).json(
            new ApiResponse(201, { order, service: newService }, "Service added to order successfully")
        );

    } catch (error) {
        console.error("❌ Error adding machine to order:", error);
        return res.status(500).json({ message: "Failed to add machine to order", error: error.message });
    }
});

const deleteMachineByorderId = asyncHandler(async (req, res) => {
    try {
        console.log("🚀 ~ deleteMachineByorderId ~ route hit")
        const { orderId, serviceId } = req.params;
        console.log("🚀 ~ orderId:", orderId)
        console.log("🚀 ~ serviceId:", serviceId)

        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid or missing order ID." });
        }

        if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: "Invalid or missing service ID." });
        }

        // 1. Find the service to get related reports
        const service = await Services.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // 2. Collect report IDs
        const qaTestIds = [];
        const eloraIds = [];
        if (service.workTypeDetails) {
            service.workTypeDetails.forEach(wt => {
                if (wt.QAtest) qaTestIds.push(wt.QAtest);
                if (wt.elora) eloraIds.push(wt.elora);
            });
        }

        // 3. Delete reports
        if (qaTestIds.length > 0) await QATest.deleteMany({ _id: { $in: qaTestIds } });
        if (eloraIds.length > 0) await Elora.deleteMany({ _id: { $in: eloraIds } });

        // 4. Remove service from order
        await orderModel.findByIdAndUpdate(orderId, {
            $pull: { services: serviceId }
        });

        // 5. Delete service document
        await Services.findByIdAndDelete(serviceId);

        return res.status(200).json(new ApiResponse(200, null, "Machine deleted successfully from the order"));
    } catch (error) {
        console.error("❌ Error deleting machine:", error);
        return res.status(500).json({ message: "Failed to delete machine", error: error.message });
    }
});

const getQARawByOrderId = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        // Fetch the order and populate both engineer & office staff fields
        const order = await orderModel.findById(orderId)
            .populate({
                path: 'services',
                populate: [
                    {
                        path: 'workTypeDetails.engineer',
                        model: 'Employee',
                        select: 'name'
                    },
                    {
                        path: 'workTypeDetails.officeStaff',
                        model: 'Employee',
                        select: 'name'
                    }
                ]
            });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Extract info from services
        const qaRawDetails = [];

        order.services.forEach(service => {
            service.workTypeDetails.forEach(work => {
                qaRawDetails.push({
                    machineType: service.machineType,
                    machineModel: service.machineModel,
                    serialNumber: service.serialNumber,
                    rawFile: work.uploadFile,
                    rawPhoto: work.viewFile,
                    remark: work.remark,
                    engineerName: work.engineer?.name || 'Not Assigned',
                    officeStaffName: work.officeStaff?.name || 'Not Assigned',
                    status: work.status,
                    workType: work.workType
                });
            });
        });

        return res.status(200).json({
            srfNumber: order.srfNumber,
            hospitalName: order.hospitalName,
            qaRawDetails
        });

    } catch (error) {
        console.error("Error in getQARawByOrderId:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

//web app
//for qa test--change this after chnaging the model
const updateEmployeeStatus = asyncHandler(async (req, res) => {
    const { orderId, serviceId, employeeId, status } = req.params;
    console.log("🚀 ~ employeeId:", employeeId)

    if (!orderId || !serviceId || !employeeId) {
        return res.status(400).json({ message: "Missing required params" });
    }
    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== "Employee") {
        return res.status(404).json({ message: "Invalid employee" });
    }
    // 2. Find the order and validate it
    const order = await orderModel.findById(orderId).populate("services");
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    // 3. Find the service and update it
    const serviceToUpdate = await Services.findById(serviceId);
    if (!serviceToUpdate) {
        return res.status(404).json({ message: "Service not found" });
    }
    // 4. Assign employee to each workTypeDetails item
    serviceToUpdate.workTypeDetails.forEach((work) => {
        work.employee = employeeId;
        if (status) {
            work.status = status;
        }
    });
    await serviceToUpdate.save();
    res.status(200).json({
        message: "Service employee updated successfully",
        service: serviceToUpdate,
    });
});


//mobile api
const getMachineDetails = asyncHandler(async (req, res) => {
    const { technicianId, orderId, serviceId } = req.params;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(serviceId) ||
        !mongoose.Types.ObjectId.isValid(technicianId)) {
        return res.status(400).json({ message: "Invalid IDs provided" });
    }

    try {
        // Fetch order and populate services
        const order = await orderModel.findById(orderId).populate('services');
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Find the specific service
        const service = order.services.find(s => s._id.toString() === serviceId);
        if (!service) return res.status(404).json({ message: "Service not found in this order" });

        // Filter workTypeDetails assigned to this technician
        const result = service.workTypeDetails
            .filter(work => work.engineer?.toString() === technicianId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // 🔥 latest on top
            .map(work => ({
                machineType: service.machineType,
                workType: work.workType,
                status: work.status
            }));
        return res.status(200).json(result);

    } catch (error) {
        console.error("Error fetching machine details:", error);
        return res.status(500).json({ message: "Server error" });
    }
});






//mobile
// PATCH /api/orders/:orderId/services/:serviceId/worktypes
//use this for mobile


// PATCH /api/orders/:orderId/services/:serviceId/worktypes/:technicianId
// const updateServiceWorkType = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, technicianId, machineType, workType } = req.params;
//     const { machineModel, serialNumber, uploadFile, viewFile, remark } = req.body;

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(technicianId)) {
//         return res.status(400).json({ message: "Invalid IDs" });
//     }

//     // Step 1: Find order and ensure the service belongs to it
//     const order = await orderModel.findById(orderId).populate('services');
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // Step 2: Find the service by machineType
//     const service = order.services.find(s => s.machineType === machineType && s._id.equals(serviceId));
//     if (!service) return res.status(404).json({ message: "Service not found in this order" });

//     // Step 3: Update machineModel and serialNumber if provided
//     if (machineModel) service.machineModel = machineModel;
//     if (serialNumber) service.serialNumber = serialNumber;

//     // Step 4: Find workTypeDetail by workType and technician
//     const workTypeDetail = service.workTypeDetails.find(wt =>
//         wt.workType === workType &&
//         ((wt.engineer && wt.engineer.toString() === technicianId) ||
//             (wt.officeStaff && wt.officeStaff.toString() === technicianId))
//     );

//     if (!workTypeDetail) {
//         return res.status(404).json({ message: "WorkTypeDetail not found for this technician" });
//     }

//     // Step 5: Update optional fields from req.body
//     if (uploadFile !== undefined) workTypeDetail.uploadFile = uploadFile;
//     if (viewFile !== undefined) workTypeDetail.viewFile = viewFile;
//     if (remark !== undefined) workTypeDetail.remark = remark;

//     // Step 6: Save the updated service
//     await service.save();

//     res.status(200).json({
//         success: true,
//         message: "Service workType updated successfully",
//         service
//     });
// });


// const updateServiceWorkType = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, technicianId, machineType, workType } = req.params;
//     const { machineModel, serialNumber, remark } = req.body;
//     console.log("🚀 ~ remark:", remark)

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(technicianId)) {
//         return res.status(400).json({ message: "Invalid IDs" });
//     }

//     const order = await orderModel.findById(orderId).populate('services');
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     const service = order.services.find(s => s.machineType === machineType && s._id.equals(serviceId));
//     if (!service) return res.status(404).json({ message: "Service not found in this order" });

//     if (machineModel) service.machineModel = machineModel;
//     if (serialNumber) service.serialNumber = serialNumber;

//     const workTypeDetail = service.workTypeDetails.find(wt =>
//         wt.workType === workType &&
//         ((wt.engineer && wt.engineer.toString() === technicianId) ||
//             (wt.officeStaff && wt.officeStaff.toString() === technicianId))
//     );

//     if (!workTypeDetail) {
//         return res.status(404).json({ message: "WorkTypeDetail not found for this technician" });
//     }

//     // Handle file uploads
//     if (req.files) {
//         // Single uploadFile
//         if (req.files.uploadFile && req.files.uploadFile[0]) {
//             const uploaded = await uploadToS3(req.files.uploadFile[0]);
//             workTypeDetail.uploadFile = uploaded.url;
//         }

//         // Multiple viewFiles
//         if (req.files.viewFile && req.files.viewFile.length > 0) {
//             const urls = [];
//             for (let file of req.files.viewFile) {
//                 const uploaded = await uploadToS3(file);
//                 urls.push(uploaded.url);
//             }
//             workTypeDetail.viewFile = urls; // store array of URLs
//         }
//     }

//     // Update remark if present
//     // Update remark if present
//     if (remark !== undefined) {
//         service.remark = remark;
//     }

//     // Save service after all changes
//     await service.save();

//     res.status(200).json({
//         success: true,
//         message: "Service workType updated successfully",
//         service
//     });

// });



// const updateServiceWorkType = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, technicianId, machineType, workType } = req.params;
//     console.log("🚀 ~ workType:", workType)
//     const { machineModel, serialNumber, remark, isSubmitted } = req.body; // receive isSubmitted from body
//     if (!isSubmitted) {
//         return res.status(400).json({ message: "isSubmitted is required" });
//     }
//     // ✅ Validate IDs
//     if (
//         !mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(technicianId)
//     ) {
//         return res.status(400).json({ message: "Invalid IDs" });
//     }

//     // ✅ Find order
//     const order = await orderModel.findById(orderId).populate("services");
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // ✅ Find service
//     const service = order.services.find(
//         (s) => s.machineType === machineType && s._id.equals(serviceId)
//     );
//     if (!service) return res.status(404).json({ message: "Service not found in this order" });

//     // ✅ Update service fields
//     if (machineModel) service.machineModel = machineModel;
//     if (serialNumber) service.serialNumber = serialNumber;
//     if (remark !== undefined) service.remark = remark;

//     // ✅ Find workTypeDetail for this technician
//     const workTypeDetail = service.workTypeDetails.find(
//         (wt) =>
//             wt.workType === workType &&
//             ((wt.engineer && wt.engineer.toString() === technicianId) ||
//                 (wt.officeStaff && wt.officeStaff.toString() === technicianId))
//     );

//     if (!workTypeDetail) {
//         return res
//             .status(404)
//             .json({ message: "WorkTypeDetail not found for this technician" });
//     }

//     // ✅ Update isSubmitted from req.body
//     if (isSubmitted !== undefined) {
//         workTypeDetail.isSubmitted = Boolean(isSubmitted); // save it in DB
//     }

//     // ✅ Handle file uploads
//     if (req.files) {
//         if (req.files.uploadFile && req.files.uploadFile[0]) {
//             const uploaded = await uploadToS3(req.files.uploadFile[0]);
//             workTypeDetail.uploadFile = uploaded.url;
//         }

//         if (req.files.viewFile && req.files.viewFile.length > 0) {
//             const urls = [];
//             for (let file of req.files.viewFile) {
//                 const uploaded = await uploadToS3(file);
//                 urls.push(uploaded.url);
//             }
//             workTypeDetail.viewFile = urls;
//         }
//     }

//     // ✅ Always create/update QA Test entry
//     const qaTest = new QATest({
//         officeStaff: technicianId,
//         reportULRNumber: generateULRReportNumber(),
//         qaTestReportNumber: generateQATestReportNumber(),
//     });
//     await qaTest.save();
//     workTypeDetail.QAtest = qaTest._id;
//     incrementSequence();

//     // ✅ Always create/update Elora entry
//     const elora = new Elora({
//         officeStaff: technicianId,
//         reportULRNumber: generateULRReportNumber(),
//         qaTestReportNumber: generateQATestReportNumber(),
//     });
//     await elora.save();
//     workTypeDetail.elora = elora._id;
//     incrementSequence();

//     // ✅ Save service
//     await service.save();

//     res.status(200).json({
//         success: true,
//         message: "Service workType updated successfully",
//         service,
//     });
// });



// const updateServiceWorkType = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, technicianId, machineType, workType } = req.params;
//     const { machineModel, serialNumber, remark, isSubmitted } = req.body;

//     if (isSubmitted === undefined) {
//         return res.status(400).json({ message: "isSubmitted is required" });
//     }

//     // ✅ Validate IDs
//     if (
//         !mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(technicianId)
//     ) {
//         return res.status(400).json({ message: "Invalid IDs" });
//     }

//     // ✅ Find order
//     const order = await orderModel.findById(orderId).populate("services");
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // ✅ Find service
//     const service = order.services.find(
//         (s) => s.machineType === machineType && s._id.equals(serviceId)
//     );
//     if (!service) return res.status(404).json({ message: "Service not found in this order" });

//     // ✅ Update service fields
//     if (machineModel) service.machineModel = machineModel;
//     if (serialNumber) service.serialNumber = serialNumber;
//     if (remark !== undefined) service.remark = remark;

//     // ✅ Find workTypeDetail for this technician
//     const workTypeDetail = service.workTypeDetails.find(
//         (wt) =>
//             wt.workType === workType &&
//             ((wt.engineer && wt.engineer.toString() === technicianId) ||
//                 (wt.officeStaff && wt.officeStaff.toString() === technicianId))
//     );

//     if (!workTypeDetail) {
//         return res.status(404).json({ message: "WorkTypeDetail not found for this technician" });
//     }

//     // ✅ Update isSubmitted
//     workTypeDetail.isSubmitted = Boolean(isSubmitted);

//     // ✅ Handle file uploads
//     if (req.files) {
//         if (req.files.uploadFile && req.files.uploadFile[0]) {
//             const uploaded = await uploadToS3(req.files.uploadFile[0]);
//             workTypeDetail.uploadFile = uploaded.url;
//         }

//         if (req.files.viewFile && req.files.viewFile.length > 0) {
//             const urls = [];
//             for (let file of req.files.viewFile) {
//                 const uploaded = await uploadToS3(file);
//                 urls.push(uploaded.url);
//             }
//             workTypeDetail.viewFile = urls;
//         }
//     }

//     // ✅ Generate QATest Report with numbers
//     const reportULRNumber = await generateULRReportNumber();
//     const qaTestReportNumber = await generateQATestReportNumber();

//     const qaTest = new QATest({
//         officeStaff: technicianId,
//         reportULRNumber,
//         qaTestReportNumber,
//     });
//     await qaTest.save();
//     workTypeDetail.QAtest = qaTest._id;

//     // ✅ Save service
//     await service.save();

//     res.status(200).json({
//         success: true,
//         message: "Service workType updated successfully",
//         service,
//         qaTestId: qaTest._id,
//         reportULRNumber,
//         qaTestReportNumber,
//     });
// });


// const updateServiceWorkType = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, technicianId, machineType, workType } = req.params;
//     const { machineModel, serialNumber, remark, isSubmitted } = req.body;

//     if (isSubmitted === undefined) {
//         return res.status(400).json({ message: "isSubmitted is required" });
//     }

//     // ✅ Validate IDs
//     if (
//         !mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(technicianId)
//     ) {
//         return res.status(400).json({ message: "Invalid IDs" });
//     }

//     // ✅ Find order
//     const order = await orderModel.findById(orderId).populate("services");
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     // ✅ Find service
//     const service = order.services.find(
//         (s) => s.machineType === machineType && s._id.equals(serviceId)
//     );
//     if (!service) return res.status(404).json({ message: "Service not found in this order" });

//     // ✅ Update service fields
//     if (machineModel) service.machineModel = machineModel;
//     if (serialNumber) service.serialNumber = serialNumber;
//     if (remark !== undefined) service.remark = remark;

//     // ✅ Find workTypeDetail for this technician
//     const workTypeDetail = service.workTypeDetails.find(
//         (wt) =>
//             wt.workType === workType &&
//             ((wt.engineer && wt.engineer.toString() === technicianId) ||
//                 (wt.officeStaff && wt.officeStaff.toString() === technicianId))
//     );

//     if (!workTypeDetail) {
//         return res.status(404).json({ message: "WorkTypeDetail not found for this technician" });
//     }

//     // ✅ Update isSubmitted
//     workTypeDetail.isSubmitted = Boolean(isSubmitted);

//     // ✅ Handle file uploads
//     if (req.files) {
//         if (req.files.uploadFile && req.files.uploadFile[0]) {
//             const uploaded = await uploadToS3(req.files.uploadFile[0]);
//             workTypeDetail.uploadFile = uploaded.url;
//         }

//         if (req.files.viewFile && req.files.viewFile.length > 0) {
//             const urls = [];
//             for (let file of req.files.viewFile) {
//                 const uploaded = await uploadToS3(file);
//                 urls.push(uploaded.url);
//             }
//             workTypeDetail.viewFile = urls;
//         }
//     }

//     // ✅ Generate or update QATest Report with numbers
//     const reportULRNumber = await generateULRReportNumber();
//     const qaTestReportNumber = await generateQATestReportNumber();

//     let qaTest;
//     if (workTypeDetail.QAtest) {
//         // Update existing QA Test
//         qaTest = await QATest.findById(workTypeDetail.QAtest);
//         if (qaTest) {
//             qaTest.reportULRNumber = reportULRNumber;
//             qaTest.qaTestReportNumber = qaTestReportNumber;
//             await qaTest.save();
//         } else {
//             // fallback: create new QA Test if not found
//             qaTest = new QATest({
//                 officeStaff: technicianId,
//                 reportULRNumber,
//                 qaTestReportNumber,
//             });
//             await qaTest.save();
//             workTypeDetail.QAtest = qaTest._id;
//         }
//     } else {
//         // Create new QA Test
//         qaTest = new QATest({
//             officeStaff: technicianId,
//             reportULRNumber,
//             qaTestReportNumber,
//         });
//         await qaTest.save();
//         workTypeDetail.QAtest = qaTest._id;
//     }

//     // ✅ Save service
//     await service.save();

//     res.status(200).json({
//         success: true,
//         message: "Service workType updated successfully",
//         service,
//         qaTestId: qaTest._id,
//         reportULRNumber,
//         qaTestReportNumber,
//     });
// });


// const updateServiceWorkType = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, technicianId, machineType, workType } = req.params;
//     const { machineModel, serialNumber, remark, isSubmitted } = req.body;

//     if (isSubmitted === undefined) {
//         return res.status(400).json({ message: "isSubmitted is required" });
//     }

//     // Validate IDs
//     if (
//         !mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(technicianId)
//     ) {
//         return res.status(400).json({ message: "Invalid IDs" });
//     }

//     const order = await orderModel.findById(orderId).populate("services");
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     const service = order.services.find(
//         (s) => s.machineType === machineType && s._id.equals(serviceId)
//     );
//     if (!service) return res.status(404).json({ message: "Service not found in this order" });

//     if (machineModel) service.machineModel = machineModel;
//     if (serialNumber) service.serialNumber = serialNumber;
//     if (remark !== undefined) service.remark = remark;

//     const workTypeDetail = service.workTypeDetails.find(
//         (wt) =>
//             wt.workType === workType &&
//             ((wt.engineer && wt.engineer.toString() === technicianId) ||
//                 (wt.officeStaff && wt.officeStaff.toString() === technicianId))
//     );

//     if (!workTypeDetail) {
//         return res.status(404).json({ message: "WorkTypeDetail not found for this technician" });
//     }

//     // Update isSubmitted
//     workTypeDetail.isSubmitted = Boolean(isSubmitted);


//     // ✅ Mark attendance if isSubmitted = true
//     if (workTypeDetail.isSubmitted) {
//         const today = new Date();
//         const startOfDay = new Date(today.setHours(0, 0, 0, 0));
//         const endOfDay = new Date(today.setHours(23, 59, 59, 999));

//         // Check if attendance already exists
//         let attendance = await Attendance.findOne({
//             employee: technicianId,
//             date: { $gte: startOfDay, $lte: endOfDay }
//         });

//         if (!attendance) {
//             attendance = new Attendance({
//                 employee: technicianId,
//                 date: new Date(),
//                 status: 'Present',

//             });
//             await attendance.save();
//         } else {
//             // Optional: update status if previously marked Absent
//             attendance.status = 'Present';
//             await attendance.save();
//         }
//     }

//     // Handle file uploads
//     if (req.files) {
//         if (req.files.uploadFile && req.files.uploadFile[0]) {
//             const uploaded = await uploadToS3(req.files.uploadFile[0]);
//             workTypeDetail.uploadFile = uploaded.url;
//         }

//         if (req.files.viewFile && req.files.viewFile.length > 0) {
//             const urls = [];
//             for (let file of req.files.viewFile) {
//                 const uploaded = await uploadToS3(file);
//                 urls.push(uploaded.url);
//             }
//             workTypeDetail.viewFile = urls;
//         }
//     }

//     // Generate or update QA Test report
//     // const reportULRNumber = await generateULRReportNumber();
//     // const qaTestReportNumber = await generateQATestReportNumber();
//     // Generate or update QA Test report
//     const sequence = await getNextSequence();
//     const reportULRNumber = generateULRReportNumber(sequence);
//     const qaTestReportNumber = generateQATestReportNumber(sequence);


//     let qaTest;
//     if (workTypeDetail.QAtest) {
//         qaTest = await QATest.findById(workTypeDetail.QAtest);
//         if (qaTest) {
//             qaTest.reportULRNumber = reportULRNumber;
//             qaTest.qaTestReportNumber = qaTestReportNumber;
//             await qaTest.save();
//         } else {
//             qaTest = new QATest({
//                 officeStaff: technicianId,
//                 reportULRNumber,
//                 qaTestReportNumber,
//             });
//             await qaTest.save();
//             workTypeDetail.QAtest = qaTest._id;
//         }
//     } else {
//         qaTest = new QATest({
//             officeStaff: technicianId,
//             reportULRNumber,
//             qaTestReportNumber,
//         });
//         await qaTest.save();
//         workTypeDetail.QAtest = qaTest._id;
//     }

//     await service.save();

//     res.status(200).json({
//         success: true,
//         message: "Service workType updated successfully",
//         service,
//         qaTestId: qaTest._id,
//         reportULRNumber,
//         qaTestReportNumber,
//     });
// });

const updateServiceWorkType = asyncHandler(async (req, res) => {
    const { orderId, serviceId, technicianId, machineType, workType } = req.params;
    const { machineModel, serialNumber, remark, isSubmitted } = req.body;

    if (isSubmitted === undefined) {
        return res.status(400).json({ message: "isSubmitted is required" });
    }

    // Validate IDs
    if (
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(serviceId) ||
        !mongoose.Types.ObjectId.isValid(technicianId)
    ) {
        return res.status(400).json({ message: "Invalid IDs" });
    }

    const order = await orderModel.findById(orderId).populate("services");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const service = order.services.find(
        (s) => s.machineType === machineType && s._id.equals(serviceId)
    );
    if (!service) return res.status(404).json({ message: "Service not found in this order" });

    if (machineModel) service.machineModel = machineModel;
    if (serialNumber) service.serialNumber = serialNumber;
    if (remark !== undefined) service.remark = remark;

    const workTypeDetail = service.workTypeDetails.find(
        (wt) =>
            wt.workType === workType &&
            ((wt.engineer && wt.engineer.toString() === technicianId) ||
                (wt.officeStaff && wt.officeStaff.toString() === technicianId))
    );

    if (!workTypeDetail) {
        return res.status(404).json({ message: "WorkTypeDetail not found for this technician" });
    }

    // Update isSubmitted
    workTypeDetail.isSubmitted = Boolean(isSubmitted);


    // ✅ Mark attendance if isSubmitted = true
    if (workTypeDetail.isSubmitted) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Check if attendance already exists
        let attendance = await Attendance.findOne({
            employee: technicianId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (!attendance) {
            attendance = new Attendance({
                employee: technicianId,
                date: new Date(),
                status: 'Present',

            });
            await attendance.save();
        } else {
            // Optional: update status if previously marked Absent
            attendance.status = 'Present';
            await attendance.save();
        }
    }

    // Handle file uploads
    if (req.files) {
        if (req.files.uploadFile && req.files.uploadFile[0]) {
            const uploaded = await uploadToS3(req.files.uploadFile[0]);
            workTypeDetail.uploadFile = uploaded.url;
        }

        if (req.files.viewFile && req.files.viewFile.length > 0) {
            const urls = [];
            for (let file of req.files.viewFile) {
                const uploaded = await uploadToS3(file);
                urls.push(uploaded.url);
            }
            workTypeDetail.viewFile = urls;
        }
    }

    // Generate or update QA Test report
    // const reportULRNumber = await generateULRReportNumber();
    // const qaTestReportNumber = await generateQATestReportNumber();
    // Generate or update QA Test report
    const sequence = await getNextSequence();
    const reportULRNumber = generateULRReportNumber(sequence);
    const qaTestReportNumber = generateQATestReportNumber(sequence);


    let qaTest;
    // ✅ Capture qatestSubmittedAt when isSubmitted is true
    const qatestSubmittedAt = isSubmitted ? new Date() : null;

    if (workTypeDetail.QAtest) {
        qaTest = await QATest.findById(workTypeDetail.QAtest);
        if (qaTest) {
            qaTest.reportULRNumber = reportULRNumber;
            qaTest.qaTestReportNumber = qaTestReportNumber;
            // ✅ Set qatestSubmittedAt if isSubmitted is true (preserve first submission time)
            if (isSubmitted && !qaTest.qatestSubmittedAt) {
                qaTest.qatestSubmittedAt = qatestSubmittedAt;
            }
            await qaTest.save();
        } else {
            qaTest = new QATest({
                officeStaff: technicianId,
                reportULRNumber,
                qaTestReportNumber,
                qatestSubmittedAt: qatestSubmittedAt,
            });
            await qaTest.save();
            workTypeDetail.QAtest = qaTest._id;
        }
    } else {
        qaTest = new QATest({
            officeStaff: technicianId,
            reportULRNumber,
            qaTestReportNumber,
            qatestSubmittedAt: qatestSubmittedAt,
        });
        await qaTest.save();
        workTypeDetail.QAtest = qaTest._id;
    }

    await service.save();

    res.status(200).json({
        success: true,
        message: "Service workType updated successfully",
        service,
        qaTestId: qaTest._id,
        reportULRNumber,
        qaTestReportNumber,
    });
});



const getReportNumbers = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, technicianId, workType } = req.params;

        // ✅ Validate IDs
        if (
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !mongoose.Types.ObjectId.isValid(serviceId) ||
            !mongoose.Types.ObjectId.isValid(technicianId)
        ) {
            return res.status(400).json({ message: "Invalid IDs" });
        }

        // ✅ Find order and populate services
        const order = await orderModel.findById(orderId).populate({
            path: "services",
            populate: {
                path: "workTypeDetails.QAtest workTypeDetails.elora", // populate both
            },
        });

        if (!order) return res.status(404).json({ message: "Order not found" });

        // ✅ Find the service
        const service = order.services.find((s) => s._id.equals(serviceId));
        if (!service) return res.status(404).json({ message: "Service not found" });

        // ✅ Find workTypeDetail for technician
        const workTypeDetail = service.workTypeDetails.find(
            (wt) =>
                wt.workType === workType &&
                ((wt.engineer && wt.engineer.toString() === technicianId) ||
                    (wt.officeStaff && wt.officeStaff.toString() === technicianId))
        );

        if (!workTypeDetail) {
            return res.status(404).json({ message: "WorkTypeDetail not found" });
        }

        // ✅ Extract numbers
        let reportNumbers = {};

        if (workTypeDetail.QAtest) {
            reportNumbers.qaTest = {
                reportULRNumber: workTypeDetail.QAtest.reportULRNumber,
                qaTestReportNumber: workTypeDetail.QAtest.qaTestReportNumber,
            };
        }

        if (workTypeDetail.elora) {
            reportNumbers.elora = {
                reportULRNumber: workTypeDetail.elora.reportULRNumber,
                qaTestReportNumber: workTypeDetail.elora.qaTestReportNumber,
            };
        }

        res.status(200).json({
            success: true,
            reportNumbers,
        });
    } catch (error) {
        console.error("❌ getReportNumbers error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


//mobile--My orders
// const getAllInProgressOrders = asyncHandler(async (req, res) => {
//     const { technicianId, orderId, serviceId } = req.params;

//     if (!technicianId || !orderId || !serviceId) {
//         return res.status(400).json({ message: 'Technician ID, Order ID, and Service ID are required' });
//     }
//     const service = await Services.findById(serviceId);
//     if (!service) {
//         return res.status(404).json({ message: 'Service not found' });
//     }
//     const hasInProgressWork = service.workTypeDetails.some(
//         (work) =>
//             work.employee?.toString() === technicianId &&
//             work.status === 'inprogress'
//     );
//     if (!hasInProgressWork) {
//         return res.status(400).json({ message: 'No in-progress work found for this technician in the given service' });
//     }
//     // Step 2: Find all services with inprogress work for the technician
//     const servicesWithInProgress = await Services.find({
//         workTypeDetails: {
//             $elemMatch: {
//                 employee: new mongoose.Types.ObjectId(technicianId),
//                 status: 'inprogress',
//             },
//         },
//     });
//     const serviceIds = servicesWithInProgress.map((s) => s._id);
//     // Step 3: Find orders containing those services
//     const orders = await orderModel.find({
//         services: { $in: serviceIds },
//     })
//         .populate({
//             path: 'services',
//             populate: {
//                 path: 'workTypeDetails.employee',
//                 model: 'Employee',
//             },
//         })
//         .populate('customer', 'name email')
//         .sort({ createdAt: -1 });
//     res.status(200).json({
//         message: 'In-progress orders fetched successfully',
//         count: orders.length,
//         orders,
//     });
// });


//create order--by admin

// const createOrder = asyncHandler(async (req, res) => {
//     try {
//         console.log("hi---📥 req body:", req.body);
//         const {
//             leadOwner, // userId from frontend
//             hospitalName,
//             fullAddress,
//             city,
//             district,
//             state,
//             pinCode,
//             branchName,
//             contactPersonName,
//             emailAddress,
//             contactNumber,
//             designation,
//             advanceAmount,
//             workOrderCopy,
//             partyCodeOrSysId,
//             procNoOrPoNo,
//             procExpiryDate,
//             urgency,
//             services,
//             additionalServices, // will handle as references
//             specialInstructions,
//             courierDetails,
//             reportULRNumber,
//             qaTestReportNumber,
//             rawFile,
//             rawPhoto,
//         } = req.body;

//         // ✅ Validate required fields
//         if (
//             !leadOwner ||
//             !hospitalName ||
//             !fullAddress ||
//             !city ||
//             !district ||
//             !state ||
//             !pinCode ||
//             !branchName ||
//             !contactPersonName ||
//             !emailAddress ||
//             !contactNumber
//         ) {
//             throw new ApiError(400, "Missing required fields");
//         }

//         // ✅ Find lead owner user
//         const leadOwnerUser = await User.findById(leadOwner).select("name role");
//         if (!leadOwnerUser) {
//             throw new ApiError(404, "Lead owner not found");
//         }

//         // ✅ Step 1: Find or create client by phone
//         let client = await Client.findOne({ phone: contactNumber });
//         if (!client) {
//             client = await Client.create({
//                 name: contactPersonName,
//                 phone: contactNumber,
//                 email: emailAddress,
//                 address: fullAddress,
//                 role: "Customer",
//             });
//         }

//         // ✅ Step 2: Create hospital and link to client
//         const hospital = await Hospital.create({
//             name: hospitalName,
//             email: emailAddress,
//             address: fullAddress,
//             branch: branchName,
//             phone: contactNumber,
//             city,
//             district,
//             state,
//             pinCode,
//         });

//         if (!client.hospitals.includes(hospital._id)) {
//             client.hospitals.push(hospital._id);
//             await client.save();
//         }

//         // ✅ Step 3: Parse services (if stringified)
//         let parsedServices = [];
//         if (services) {
//             if (typeof services === "string") {
//                 try {
//                     parsedServices = JSON.parse(services);
//                 } catch (err) {
//                     throw new ApiError(400, "Invalid services format, must be JSON array");
//                 }
//             } else {
//                 parsedServices = services;
//             }
//         }

//         // ✅ Step 4: Transform workType → workTypeDetails
//         let transformedServices = parsedServices.map((s) => ({
//             ...s,
//             workTypeDetails: (s.workType || []).map((wt) => ({
//                 workType: wt,
//                 status: "pending",
//             })),
//         }));

//         console.log("🚀 ~ transformedServices:", transformedServices);

//         // ✅ Step 5: Save services to DB and map ObjectIds
//         let serviceDocs = [];
//         if (transformedServices.length > 0) {
//             serviceDocs = await Services.insertMany(transformedServices);
//             console.log("🚀 ~ serviceDocs:", serviceDocs);
//         }

//         // ✅ Step 6: Parse and upsert additionalServices
//         let parsedAdditional = [];
//         if (additionalServices) {
//             if (typeof additionalServices === "string") {
//                 try {
//                     parsedAdditional = JSON.parse(additionalServices);
//                 } catch (err) {
//                     throw new ApiError(400, "Invalid additionalServices format, must be JSON array");
//                 }
//             } else {
//                 parsedAdditional = additionalServices;
//             }
//         }

//         // Expected format: [{ name: "INSTITUTE REGISTRATION", description: "", totalAmount: 1000 }]
//         let additionalServiceDocs = [];
//         if (Array.isArray(parsedAdditional) && parsedAdditional.length > 0) {
//             additionalServiceDocs = await Promise.all(
//                 parsedAdditional.map(async (svc) => {
//                     let existing = await AdditionalService.findOne({ name: svc.name });
//                     if (!existing) {
//                         existing = await AdditionalService.create({
//                             name: svc.name,
//                             description: svc.description || "",
//                             totalAmount: svc.totalAmount || 0,
//                         });
//                     }
//                     return existing._id;
//                 })
//             );
//         }

//         // ✅ Step 7: Create order
//         // const order = await orderModel.create({
//         //     leadOwner: leadOwnerUser.name, // store name instead of ID
//         //     // leadOwner: leadOwnerUser._id,
//         //     hospitalName,
//         //     fullAddress,
//         //     city,
//         //     district,
//         //     state,
//         //     pinCode,
//         //     branchName,
//         //     contactPersonName,
//         //     emailAddress,
//         //     contactNumber,
//         //     designation,
//         //     advanceAmount,
//         //     workOrderCopy,
//         //     partyCodeOrSysId,
//         //     procNoOrPoNo,
//         //     procExpiryDate,
//         //     customer: client._id,
//         //     urgency,
//         //     services: serviceDocs.map((s) => s._id),
//         //     additionalServices: additionalServiceDocs, // ✅ only ObjectIds here
//         //     specialInstructions,
//         //     courierDetails,
//         //     reportULRNumber,
//         //     qaTestReportNumber,
//         //     rawFile,
//         //     rawPhoto,

//         // });
//         const order = await orderModel.create({
//             leadOwner: leadOwnerUser.name,
//             hospitalName,
//             fullAddress,
//             city,
//             district,
//             state,
//             pinCode,
//             branchName,
//             contactPersonName,
//             emailAddress,
//             contactNumber,
//             designation,
//             advanceAmount,
//             workOrderCopy,
//             partyCodeOrSysId,
//             procNoOrPoNo,
//             procExpiryDate,
//             customer: client._id,
//             urgency,
//             services: serviceDocs.map((s) => s._id),
//             additionalServices: additionalServiceDocs,
//             specialInstructions,
//             courierDetails,
//             reportULRNumber,
//             qaTestReportNumber,
//             rawFile,
//             rawPhoto,
//             hospital: hospital._id, 
//         });


//         console.log("🚀 ~ order:", order);

//         return res
//             .status(201)
//             .json(new ApiResponse(201, order, "Order created successfully"));
//     } catch (error) {
//         console.error("❌ Error creating order:", error);
//         throw new ApiError(500, "Failed to create order", [error.message]);
//     }
// });





// export const createOrder = asyncHandler(async (req, res) => {
//     try {
//         console.log("📥 req.body:", req.body);
//         console.log("📎 req.file:", req.file);

//         const {
//             leadOwner,
//             hospitalName,
//             fullAddress,
//             city,
//             district,
//             state,
//             pinCode,
//             branchName,
//             contactPersonName,
//             emailAddress,
//             contactNumber,
//             designation,
//             advanceAmount,
//             partyCodeOrSysId,
//             procNoOrPoNo,
//             procExpiryDate,
//             urgency,
//             services,
//             additionalServices,
//             specialInstructions,
//             courierDetails,
//             reportULRNumber,
//             qaTestReportNumber,
//             rawFile,
//             rawPhoto,
//         } = req.body;

//         // ✅ Validate required fields
//         if (
//             !leadOwner ||
//             !hospitalName ||
//             !fullAddress ||
//             !city ||

//             !state ||
//             !pinCode ||

//             !contactPersonName ||
//             !emailAddress ||
//             !contactNumber
//         ) {
//             throw new ApiError(400, "Missing required fields");
//         }

//         // ✅ Find lead owner user
//         const leadOwnerUser = await User.findById(leadOwner).select("name role");
//         if (!leadOwnerUser) throw new ApiError(404, "Lead owner not found");

//         // ✅ Check if email already exists (in Client collection)
//         const existingClient = await Client.findOne({ email: emailAddress });
//         if (existingClient) {
//             return res.status(400).json(
//                 new ApiResponse(
//                     400,
//                     null,
//                     `A client with email "${emailAddress}" already exists`
//                 )
//             );
//         }

//         // ✅ Step 1: Find or create client
//         let client = await Client.findOne({ phone: contactNumber });
//         if (!client) {
//             client = await Client.create({
//                 name: contactPersonName,
//                 phone: contactNumber,
//                 email: emailAddress,
//                 address: fullAddress,
//                 role: "Customer",
//             });
//         }

//         // ✅ Step 2: Create hospital
//         const hospital = await Hospital.create({
//             name: hospitalName,
//             email: emailAddress,
//             address: fullAddress,
//             branch: branchName,
//             phone: contactNumber,
//             city,
//             district,
//             state,
//             pinCode,
//         });

//         if (!client.hospitals.includes(hospital._id)) {
//             client.hospitals.push(hospital._id);
//             await client.save();
//         }

//         // ✅ Step 3: Upload file to S3 (if provided)
//         let workOrderCopyUrl = "";
//         if (req.file) {
//             const { url } = await uploadToS3(req.file);
//             workOrderCopyUrl = url;
//         }

//         // ✅ Step 4: Parse services
//         let parsedServices = [];
//         if (services) {
//             parsedServices =
//                 typeof services === "string" ? JSON.parse(services) : services;
//         }

//         let transformedServices = parsedServices.map((s) => ({
//             ...s,
//             workTypeDetails: (s.workType || []).map((wt) => ({
//                 workType: wt,
//                 status: "pending",
//             })),
//         }));

//         let serviceDocs = [];
//         if (transformedServices.length > 0) {
//             serviceDocs = await Services.insertMany(transformedServices);
//         }

//         // ✅ Step 5: Parse & upsert additionalServices
//         let parsedAdditional = [];
//         if (additionalServices) {
//             parsedAdditional = typeof additionalServices === "string"
//                 ? JSON.parse(additionalServices)
//                 : additionalServices;
//         }

//         let additionalServiceDocs = [];
//         if (Array.isArray(parsedAdditional) && parsedAdditional.length) {
//             additionalServiceDocs = await Promise.all(
//                 parsedAdditional.map(async (svc) => {
//                     const doc = await AdditionalService.create({
//                         name: svc.name,
//                         description: svc.description || "",
//                         totalAmount: svc.totalAmount ?? 0,
//                     });
//                     return doc._id;
//                 })
//             );
//         }
//         console.log("Parsed additionalServices:", parsedAdditional);
//         console.log("additionalServiceDocs IDs:", additionalServiceDocs);
//         // ✅ Step 6: Create order with hospital reference + S3 file URL
//         const order = await orderModel.create({
//             leadOwner,
//             hospitalName,
//             fullAddress,
//             city,
//             district,
//             state,
//             pinCode,
//             branchName,
//             contactPersonName,
//             emailAddress,
//             contactNumber,
//             designation,
//             advanceAmount,
//             workOrderCopy: workOrderCopyUrl, // ✅ uploaded file URL
//             partyCodeOrSysId,
//             procNoOrPoNo,
//             procExpiryDate,
//             customer: client._id,
//             urgency,
//             services: serviceDocs.map((s) => s._id),
//             additionalServices: additionalServiceDocs,
//             specialInstructions,
//             courierDetails,
//             reportULRNumber,
//             qaTestReportNumber,
//             rawFile,
//             rawPhoto,
//             hospital: hospital._id, // ✅ store reference
//         });

//         console.log("✅ Order created:", order);

//         return res
//             .status(201)
//             .json(new ApiResponse(201, order, "Order created successfully"));
//     } catch (error) {
//         console.error("❌ Error creating order:", error);

//         // ✅ Handle duplicate email error (MongoDB E11000)
//         if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
//             const duplicateEmail = error.keyValue?.email || "unknown email";
//             throw new ApiError(
//                 400,
//                 `A client with email "${duplicateEmail}" already exists`
//             );
//         }

//         // ✅ For all other errors
//         throw new ApiError(500, "Failed to create order", [error.message]);
//     }

// });

// export const createOrder = asyncHandler(async (req, res) => {
//     try {
//         console.log("📥 req.body:", req.body);
//         console.log("📎 req.files:", req.files); // Changed to req.files (plural)
//         console.log("📎 req.file:", req.file); // Keep for backward compatibility

//         const {
//             leadOwner,
//             hospitalName,
//             fullAddress,
//             city,
//             district,
//             state,
//             pinCode,
//             branchName,
//             contactPersonName,
//             emailAddress,
//             contactNumber,
//             designation,
//             advanceAmount,
//             urgency,
//             services,
//             additionalServices,
//             specialInstructions,
//             courierDetails,
//             rawFile,
//             rawPhoto,
//         } = req.body;

//         /* =======================
//            1️⃣ Validate Required Fields
//         ======================== */
//         if (
//             !leadOwner ||
//             !hospitalName ||
//             !fullAddress ||
//             !city ||
//             !state ||
//             !pinCode ||
//             !contactPersonName ||
//             !emailAddress ||
//             !contactNumber
//         ) {
//             throw new ApiError(400, "Missing required fields");
//         }

//         /* =======================
//            2️⃣ Validate Lead Owner
//         ======================== */
//         const leadOwnerUser = await User.findById(leadOwner).select("name role");
//         if (!leadOwnerUser) {
//             throw new ApiError(404, "Lead owner not found");
//         }

//         /* =======================
//            3️⃣ Check Duplicate Client Email
//         ======================== */
//         const existingClient = await Client.findOne({ email: emailAddress });
//         if (existingClient) {
//             return res.status(400).json(
//                 new ApiResponse(
//                     400,
//                     null,
//                     `A client with email "${emailAddress}" already exists`
//                 )
//             );
//         }

//         /* =======================
//            4️⃣ Find or Create Client
//         ======================== */
//         let client = await Client.findOne({ phone: contactNumber });
//         if (!client) {
//             client = await Client.create({
//                 name: contactPersonName,
//                 phone: contactNumber,
//                 email: emailAddress,
//                 address: fullAddress,
//                 role: "Customer",
//             });
//         }

//         /* =======================
//            5️⃣ Create Hospital
//         ======================== */
//         const hospital = await Hospital.create({
//             name: hospitalName,
//             email: emailAddress,
//             address: fullAddress,
//             branch: branchName,
//             phone: contactNumber,
//             city,
//             district,
//             state,
//             pinCode,
//         });

//         if (!client.hospitals.includes(hospital._id)) {
//             client.hospitals.push(hospital._id);
//             await client.save();
//         }

//         /* =======================
//            6️⃣ Upload Work Order Files (multiple) - MODIFIED
//         ======================== */
//         // Get all files from the request
//         const files = req.files || (req.file ? [req.file] : []);
//         const fileUrls = {};

//         // Process each file
//         for (const file of files) {
//             const { url } = await uploadToS3(file);
//             // Extract service index from fieldname (e.g., "service_0_workOrderCopy" -> 0)
//             const match = file.fieldname.match(/service_(\d+)_workOrderCopy/);
//             if (match) {
//                 fileUrls[match[1]] = url; // Store URL by service index
//             } else if (file.fieldname === "workOrderCopy") {
//                 // Legacy support for single file upload
//                 fileUrls["main"] = url;
//             }
//         }

//         /* =======================
//            7️⃣ Parse Services
//         ======================== */
//         let parsedServices = [];
//         if (services) {
//             parsedServices =
//                 typeof services === "string" ? JSON.parse(services) : services;
//         }

//         if (!Array.isArray(parsedServices) || !parsedServices.length) {
//             throw new ApiError(400, "At least one service is required");
//         }

//         /* =======================
//            8️⃣ Transform Services (IMPORTANT)
//         ======================== */
//         const transformedServices = parsedServices.map((s, index) => ({
//             machineType: s.machineType,
//             quantity: s.quantity,
//             equipmentNo: s.equipmentNo,
//             machineModel: s.machineModel,
//             serialNumber: s.serialNumber,
//             remark: s.remark,

//             // ✅ Use service-specific work order copy if available, otherwise fallback
//             workOrderCopy: fileUrls[index] || fileUrls["main"] || s.workOrderCopy || "",
//             partyCodeOrSysId: s.partyCodeOrSysId,
//             procNoOrPoNo: s.procNoOrPoNo,
//             procExpiryDate: s.procExpiryDate,

//             workTypeDetails: (s.workType || []).map((wt) => ({
//                 workType: wt,
//                 status: "pending",
//             })),
//         }));

//         const serviceDocs = await Services.insertMany(transformedServices);

//         /* =======================
//            9️⃣ Parse Additional Services
//         ======================== */
//         let parsedAdditional = [];
//         if (additionalServices) {
//             parsedAdditional =
//                 typeof additionalServices === "string"
//                     ? JSON.parse(additionalServices)
//                     : additionalServices;
//         }

//         let additionalServiceDocs = [];
//         if (Array.isArray(parsedAdditional) && parsedAdditional.length) {
//             additionalServiceDocs = await Promise.all(
//                 parsedAdditional.map(async (svc) => {
//                     const doc = await AdditionalService.create({
//                         name: svc.name,
//                         description: svc.description || "",
//                         totalAmount: svc.totalAmount ?? 0,
//                     });
//                     return doc._id;
//                 })
//             );
//         }

//         /* =======================
//            🔟 Create Order
//         ======================== */
//         const order = await orderModel.create({
//             leadOwner,
//             hospitalName,
//             fullAddress,
//             city,
//             district,
//             state,
//             pinCode,
//             branchName,
//             contactPersonName,
//             emailAddress,
//             contactNumber,
//             designation,
//             advanceAmount,

//             customer: client._id,
//             urgency,
//             services: serviceDocs.map((s) => s._id),
//             additionalServices: additionalServiceDocs,
//             specialInstructions,
//             courierDetails,
//             rawFile,
//             rawPhoto,

//             hospital: hospital._id,
//         });

//         console.log("✅ Order created:", order);

//         return res
//             .status(201)
//             .json(new ApiResponse(201, order, "Order created successfully"));

//     } catch (error) {
//         console.error("❌ Error creating order:", error);

//         if (error.code === 11000 && error.keyPattern?.email) {
//             throw new ApiError(
//                 400,
//                 `A client with email "${error.keyValue.email}" already exists`
//             );
//         }

//         throw new ApiError(500, "Failed to create order", [error.message]);
//     }
// });

export const createOrder = asyncHandler(async (req, res) => {
    try {
        console.log("📥 req.body:", req.body);
        console.log("📎 req.files:", req.files?.map(f => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            size: f.size
        })) || "no files");
        console.log("📎 req.file:", req.file);

        const {
            leadOwner,
            hospitalName,
            fullAddress,
            city,
            district,
            state,
            pinCode,
            branchName,
            contactPersonName,
            emailAddress,
            contactNumber,
            designation,
            advanceAmount,
            urgency,
            services,
            additionalServices,
            specialInstructions,
            courierDetails,
            rawFile,
            rawPhoto,
        } = req.body;

        // 1. Validate Required Fields
        if (
            !leadOwner ||
            !hospitalName ||
            !fullAddress ||
            !city ||
            !state ||
            !pinCode ||
            !contactPersonName ||
            !emailAddress ||
            !contactNumber
        ) {
            throw new ApiError(400, "Missing required fields");
        }

        // 2. Validate Lead Owner
        const leadOwnerUser = await User.findById(leadOwner).select("name role");
        if (!leadOwnerUser) {
            throw new ApiError(404, "Lead owner not found");
        }

        // 3. Check Duplicate Client Email
        const existingClient = await Client.findOne({ email: emailAddress });
        if (existingClient) {
            return res.status(400).json(
                new ApiResponse(
                    400,
                    null,
                    `A client with email "${emailAddress}" already exists`
                )
            );
        }

        // 4. Find or Create Client
        let client = await Client.findOne({ phone: contactNumber });
        if (!client) {
            client = await Client.create({
                name: contactPersonName,
                phone: contactNumber,
                email: emailAddress,
                address: fullAddress,
                role: "Customer",
            });
        }

        // 5. Create Hospital
        const hospital = await Hospital.create({
            name: hospitalName,
            email: emailAddress,
            address: fullAddress,
            branch: branchName,
            phone: contactNumber,
            city,
            district,
            state,
            pinCode,
        });

        if (!client.hospitals.includes(hospital._id)) {
            client.hospitals.push(hospital._id);
            await client.save();
        }

        // ───────────────────────────────────────────────────────────────
        // 6. Handle multiple work order file uploads
        // ───────────────────────────────────────────────────────────────
        const files = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
        const fileUrlsByIndex = {};

        for (const file of files) {
            const { url } = await uploadToS3(file);

            // Try to match service index from fieldname
            // Supports: service_0_workOrderCopy, service_1_workOrderCopy, etc.
            const serviceIndexMatch = file.fieldname.match(/service[_-](\d+)[_-]workOrderCopy/i);

            if (serviceIndexMatch) {
                const index = serviceIndexMatch[1];
                fileUrlsByIndex[index] = url;
                console.log(`→ Attached file to service #${index}: ${file.originalname} → ${url}`);
            }
            // Legacy fallback (single file sent as "workOrderCopy")
            else if (file.fieldname === "workOrderCopy" || file.fieldname === "workOrderCopy[]") {
                fileUrlsByIndex["0"] = url; // attach to first service
                console.log(`→ Legacy file attached to service #0: ${file.originalname} → ${url}`);
            }
        }

        // 7. Parse Services
        let parsedServices = [];
        if (services) {
            parsedServices =
                typeof services === "string" ? JSON.parse(services) : services;
        }

        if (!Array.isArray(parsedServices) || parsedServices.length === 0) {
            throw new ApiError(400, "At least one service is required");
        }

        const customMachineCodeFromName = (name) => {
            const slug = String(name)
                .trim()
                .replace(/[^a-zA-Z0-9]+/g, "_")
                .replace(/^_|_$/g, "")
                .toUpperCase();
            return slug.slice(0, 64) || "CUSTOM";
        };

        for (const s of parsedServices) {
            if (s.fromOthers && s.machineType && String(s.machineType).trim()) {
                const name = String(s.machineType).trim();
                const code = customMachineCodeFromName(name);
                await CustomMachine.updateOne(
                    { name },
                    { $setOnInsert: { name, code } },
                    { upsert: true }
                );
            }
        }

        // 8. Transform Services – attach correct file URL per service
        const transformedServices = parsedServices.map((s, index) => {
            const stringIndex = String(index);

            return {
                machineType: s.machineType,
                quantity: Number(s.quantity) || 1, // ensure number
                price: Number(s.price) || 0, // ✅ added price
                equipmentNo: s.equipmentNo || "",
                machineModel: s.machineModel || "",
                // serialNumber: s.serialNumber || "",   // uncomment if needed
                // remark: s.remark || "",               // uncomment if needed

                // ── Key line: file assignment logic ────────────────────────
                workOrderCopy:
                    fileUrlsByIndex[stringIndex] ||           // per-service file
                    (index === 0 ? fileUrlsByIndex["0"] || fileUrlsByIndex["main"] : null) ||  // fallback for first service
                    "",

                partyCodeOrSysId: s.partyCodeOrSysId || "",
                procNoOrPoNo: s.procNoOrPoNo || "",
                procExpiryDate: s.procExpiryDate || "",

                workTypeDetails: (s.workType || []).map((wt) => ({
                    workType: wt,
                    status: "pending",
                })),
            };
        });

        const serviceDocs = await Services.insertMany(transformedServices);

        // 9. Parse Additional Services
        let parsedAdditional = [];
        if (additionalServices) {
            parsedAdditional =
                typeof additionalServices === "string"
                    ? JSON.parse(additionalServices)
                    : additionalServices;
        }

        let additionalServiceDocs = [];
        if (Array.isArray(parsedAdditional) && parsedAdditional.length > 0) {
            additionalServiceDocs = await Promise.all(
                parsedAdditional.map(async (svc) => {
                    const doc = await AdditionalService.create({
                        name: svc.name,
                        description: svc.description || "",
                        totalAmount: Number(svc.totalAmount) ?? 0,
                    });
                    return doc._id;
                })
            );
        }

        // 10. Create Order
        const order = await orderModel.create({
            leadOwner,
            hospitalName,
            fullAddress,
            city,
            district,
            state,
            pinCode,
            branchName,
            contactPersonName,
            emailAddress,
            contactNumber,
            designation,
            advanceAmount: Number(advanceAmount) || 0,

            customer: client._id,
            urgency,
            services: serviceDocs.map((s) => s._id),
            additionalServices: additionalServiceDocs,
            specialInstructions,
            courierDetails,
            rawFile,
            rawPhoto,

            hospital: hospital._id,
        });

        console.log("✅ Order created:", order._id, order.srfNumber);

        return res.status(201).json(
            new ApiResponse(201, order, "Order created successfully")
        );

    } catch (error) {
        console.error("❌ Error creating order:", error);

        if (error.code === 11000 && error.keyPattern?.email) {
            throw new ApiError(
                400,
                `A client with email "${error.keyValue.email}" already exists`
            );
        }

        throw new ApiError(500, "Failed to create order", [error.message]);
    }
});

const startOrder = asyncHandler(async (req, res) => {
    const { employeeId, orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ message: 'Invalid orderId or employeeId' });
    }

    // Step 1: Find the order with populated fields
    const order = await orderModel.findOne({ _id: orderId })

        .populate({ path: 'services', model: 'Service' })
        .populate({
            path: 'customer',
            model: 'User',
            select: 'name email phone role'
        });

    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

    // Step 2: Filter services and workTypes to only include ones assigned to this engineer
    const filteredServices = order.services
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // 🔥 SORT SERVICES
        .map(service => {
            const filteredWorkTypes = service.workTypeDetails
                .filter(work => work.engineer?.toString() === employeeId)
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            if (filteredWorkTypes.length > 0) {
                return {
                    ...service.toObject(),
                    workTypeDetails: filteredWorkTypes
                };
            }
            return null;
        })
        .filter(service => service !== null);
    if (filteredServices.length === 0) {
        return res.status(403).json({ message: 'Engineer is not assigned to this order' });
    }

    // Step 3: Return order but only with filtered services/workTypes
    const responseOrder = {
        ...order.toObject(),
        services: filteredServices
    };

    res.status(200).json(responseOrder);
});

//mobile api--previously created api -not using this one
const updateOrderDetails = asyncHandler(async (req, res) => {
    const { orderId, technicianId } = req.params;
    const { machineUpdates: submittedData } = req.body;

    try {
        // Step 1: Fetch the order with services and customer
        const order = await orderModel.findById(orderId)
            .populate('customer')
            .populate({
                path: 'services',
                model: 'Service'
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Step 2: Verify technician is assigned
        const isTechnicianAssigned = order.services.some(service =>
            service.workTypeDetails.some(work =>
                work.employee?.toString() === technicianId
            )
        );
        if (!isTechnicianAssigned) {
            return res.status(403).json({ message: 'Technician is not assigned to this order' });
        }
        // Step 3: General Info
        const generalInfo = {
            srfNumber: order.srfNumber,
            customerName: order.customer.name,
            contactNumber: order.contactNumber,
            procNoOrPoNo: order.procNoOrPoNo,
            procExpiryDate: order.procExpiryDate,
            quotationpdf: order.workOrderCopy
        };

        // Step 4: Apply updates to all services assigned to this technician
        if (Array.isArray(submittedData)) {
            for (const updateItem of submittedData) {
                const {
                    machineType,
                    machineModel,
                    serialNumber,
                    remark,
                    rawFile,
                    rawPhoto
                } = updateItem;

                const matchedServices = order.services.filter(
                    service => service.machineType === machineType &&
                        service.workTypeDetails.some(
                            work => work.employee?.toString() === technicianId
                        )
                );

                for (const service of matchedServices) {
                    // Update service-level fields
                    if (machineModel) service.machineModel = machineModel;
                    if (serialNumber) service.serialNumber = serialNumber;
                    if (remark) service.remark = remark;

                    // Update workTypeDetails for the technician
                    service.workTypeDetails.forEach(work => {
                        if (work.employee?.toString() === technicianId) {
                            if (remark) work.remark = remark;
                            if (rawFile) work.uploadFile = rawFile;
                            if (rawPhoto) work.viewFile = rawPhoto;
                        }
                    });
                    await service.save();
                }
            }
        }
        // Step 5: Re-fetch updated data for response
        const updatedOrder = await orderModel.findById(orderId)
            .populate('customer')
            .populate('services');
        const serviceInfo = [];
        for (const service of updatedOrder.services) {
            service.workTypeDetails.forEach(work => {
                if (work.employee?.toString() === technicianId) {
                    serviceInfo.push({
                        serviceId: service._id,
                        machineType: service.machineType,
                        machineModel: service.machineModel,
                        serialNumber: service.serialNumber,
                        remark: work.remark,
                        rawFile: work.uploadFile,
                        rawPhoto: work.viewFile,
                        workType: work.workType,
                        status: work.status
                    });
                }
            });
        }
        return res.status(200).json({
            message: 'Updates saved (if any) and data fetched',
            generalInfo,
            serviceInfo
            // countOfServices:
        });

    } catch (error) {
        console.error("Error in updateOrderDetails:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
});
//check in postman
const getSRFDetails = asyncHandler(async (req, res) => {
    const { technicianId, orderId } = req.params;

    try {
        const order = await orderModel.findById(orderId)
            .populate('customer')
            .populate('services');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // ✅ Check if this engineer is assigned in any service
        const isEngineerAssigned = order.services.some(service =>
            service.workTypeDetails.some(work =>
                work.engineer?.toString() === technicianId
            )
        );

        if (!isEngineerAssigned) {
            return res.status(403).json({ message: 'Engineer is not assigned to this order' });
        }

        const srfDetails = {
            srfNumber: order.srfNumber,
            customerName: order.customer?.name || '',
            contactNumber: order.contactNumber,
            procNoOrPoNo: order.procNoOrPoNo,
            procExpiryDate: order.procExpiryDate,
            quotationpdf: order.workOrderCopy
        };

        return res.status(200).json({ srfDetails });

    } catch (error) {
        console.error("Error in getSRFDetails:", error);
        return res.status(500).json({ message: 'Server Error' });
    }
});

//check--done
// const updateOrderServicesByTechnician = asyncHandler(async (req, res) => {
//     const { technicianId, orderId } = req.params;
//     console.log("🚀 ~ engineerId:", technicianId)
//     console.log("🚀 ~ req.params.orderId:", req.params.orderId);

//     const { serviceUpdates } = req.body; // [{ machineType, machineModel, serialNumber, remark, rawFile, rawPhoto }]
//     try {

//         if (!mongoose.Types.ObjectId.isValid(orderId)) {
//             return res.status(400).json({ message: "Invalid orderId" });
//         }

//         const order = await orderModel.findById(orderId).populate('services');
//         if (!order) {
//             console.log("Order not found in DB");
//             return res.status(404).json({ message: "Order not found" });
//         }
//         const services = order.services;
//         // ✅ Step 1: Verify engineer is assigned
//         const isEngineerAssigned = services.some(service =>
//             service.workTypeDetails.some(work =>
//                 work.engineer?.toString() === technicianId
//             )
//         );
//         if (!isEngineerAssigned) {
//             return res.status(403).json({ message: 'Engineer not assigned to any service in this order' });
//         }
//         // ✅ Step 2: Apply updates
//         for (const update of serviceUpdates) {
//             const {
//                 machineType,
//                 machineModel,
//                 serialNumber,
//                 remark,
//                 rawFile,
//                 rawPhoto
//             } = update;
//             const matchingService = services.find(
//                 service =>
//                     service.machineType === machineType &&
//                     service.workTypeDetails.some(work => work.engineer?.toString() === technicianId)
//             );
//             if (matchingService) {
//                 // Update machine-level fields
//                 if (machineModel) matchingService.machineModel = machineModel;
//                 if (serialNumber) matchingService.serialNumber = serialNumber;
//                 // if (remark) matchingService.remark = remark;

//                 // Update workTypeDetails for this engineer
//                 matchingService.workTypeDetails.forEach(work => {
//                     if (work.engineer?.toString() === technicianId) {
//                         if (remark) work.remark = remark;
//                         if (rawFile) work.uploadFile = rawFile;
//                         if (rawPhoto) work.viewFile = rawPhoto;
//                         if (['pending', 'inprogress'].includes(work.status)) {
//                             work.status = 'completed';
//                         }
//                     }
//                 });
//                 await matchingService.save();
//             }
//         }
//         await order.save();
//         return res.status(200).json({
//             message: 'Service updates saved successfully',
//             orderStatus: order.status
//         });
//     } catch (error) {
//         console.error('Error in updateOrderServicesByEngineer:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// });

const getUpdatedOrderServices = asyncHandler(async (req, res) => {
    try {
        const { technicianId, orderId, serviceId, workType } = req.params;
        // 1️⃣ Find the order and populate its services
        const order = await orderModel.findById(orderId)
            .populate({
                path: 'services',
                match: { _id: serviceId }, // get only the specified service
                populate: {
                    path: 'workTypeDetails.engineer',
                    select: 'name'
                }
            });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (!order.services || order.services.length === 0) {
            return res.status(404).json({ message: 'Service not found in this order' });
        }
        const service = order.services[0];
        // 2️⃣ Filter workTypeDetails for the given technician
        const technicianWork = service.workTypeDetails.find(
            w => w.engineer?._id?.toString() === technicianId
        );
        if (!technicianWork) {
            return res.status(403).json({ message: 'Technician not assigned to this service' });
        }
        // 3️⃣ Build response with only the updated fields
        const updatedData = {
            machineType: service.machineType,
            machineModel: service.machineModel,
            serialNumber: service.serialNumber,
            remark: technicianWork.remark || null,
            rawFile: technicianWork.uploadFile || null,
            rawPhoto: technicianWork.viewFile || null
        };
        res.status(200).json({
            success: true,
            updatedService: updatedData
        });
    } catch (error) {
        console.error('Error fetching updated order service details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const getUpdatedOrderServices2 = asyncHandler(async (req, res) => {
    try {
        const { technicianId, orderId, serviceId, workType } = req.params;
        console.log("🚀 ~ workType:", workType)
        console.log("🚀 ~ serviceId:", serviceId)
        console.log("🚀 ~ orderId:", orderId)
        console.log("🚀 ~ technicianId:", technicianId)

        // 1️⃣ Find the order and populate its services
        const order = await orderModel.findById(orderId)
            .populate({
                path: 'services',
                match: { _id: serviceId },
                populate: {
                    path: 'workTypeDetails.engineer',
                    select: 'name'
                }
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (!order.services || order.services.length === 0) {
            return res.status(404).json({ message: 'Service not found in this order' });
        }

        const service = order.services[0];

        // 2️⃣ Filter workTypeDetails for the given technician & work type
        // const technicianWork = service.workTypeDetails.find(
        //     w =>
        //         w.engineer?._id?.toString() === technicianId &&
        //         w.workType?.toLowerCase() === workType.toLowerCase()
        // );
        const technicianWork = service.workTypeDetails
            .filter(w =>
                w.engineer?._id?.toString() === technicianId &&
                w.workType?.toLowerCase() === workType.toLowerCase()
            )
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        if (!technicianWork) {
            return res.status(403).json({ message: 'Technician not assigned to this work type in this service' });
        }

        // 3️⃣ Handle single or multiple files
        const rawFileUrl = Array.isArray(technicianWork.uploadFile)
            ? await getMultipleFileUrls(technicianWork.uploadFile)
            : await getFileUrl(technicianWork.uploadFile);

        const rawPhotoUrl = Array.isArray(technicianWork.viewFile)
            ? await getMultipleFileUrls(technicianWork.viewFile)
            : await getFileUrl(technicianWork.viewFile);

        // 4️⃣ Build response with IDs + workType + signed URLs
        // const updatedData = {
        //     orderId: order._id,
        //     serviceId: service._id,
        //     technicianId,
        //     workType: technicianWork.workType || null,
        //     machineType: service.machineType,
        //     machineModel: service.machineModel,
        //     serialNumber: service.serialNumber,
        //     remark: technicianWork.remark || null,
        //     rawFile: rawFileUrl,   // ✅ signed URL(s)
        //     rawPhoto: rawPhotoUrl  // ✅ signed URL(s)
        // };
        const updatedData = {
            orderId: order._id,
            serviceId: service._id,
            technicianId,
            workType: technicianWork.workType || null,
            machineType: service.machineType,
            machineModel: service.machineModel,
            serialNumber: service.serialNumber,
            remark: service.remark || null,   // ✅ from service level
            rawFile: rawFileUrl,
            rawPhoto: rawPhotoUrl
        };

        console.log("🚀 ~ updatedData.remark:", updatedData.remark)
        res.status(200).json({
            success: true,
            updatedService: updatedData
        });

    } catch (error) {
        console.error('Error fetching updated order service details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//check
// const getAllOrdersForTechnician = asyncHandler(async (req, res) => {
//     const { technicianId } = req.params;
//     if (!technicianId) {
//         return res.status(400).json({ message: 'technicianId is required' });
//     }

//     // Step 1: Find all services where this engineer is assigned
//     const servicesWithEngineer = await Services.find({
//         workTypeDetails: {
//             $elemMatch: {
//                 engineer: new mongoose.Types.ObjectId(technicianId),
//             },
//         },
//     });

//     const serviceIds = servicesWithEngineer.map((s) => s._id);

//     if (serviceIds.length === 0) {
//         return res.status(200).json({
//             success: true,
//             count: 0,
//             orders: []
//         });
//     }

//     // Step 2: Find orders that contain those services
//     const orders = await orderModel.find({
//         services: { $in: serviceIds },
//     })
//         .populate({
//             path: 'services',
//             populate: {
//                 path: 'workTypeDetails.engineer',
//                 model: 'Employee', // Assuming engineer is also stored in Employee model
//             },
//         })
//         .populate('customer', 'name email')
//         .sort({ createdAt: -1 });

//     res.status(200).json({
//         message: 'Orders fetched successfully',
//         count: orders.length,
//         orders,
//     });
// });



const getAllOrdersForTechnician = asyncHandler(async (req, res) => {
    const { technicianId } = req.params;

    if (!technicianId) {
        return res.status(400).json({ message: "technicianId is required" });
    }

    // Step 1️⃣: Find all services that have at least one workTypeDetail with this engineer
    const servicesWithEngineer = await Services.find({
        "workTypeDetails.engineer": new mongoose.Types.ObjectId(technicianId),
    }).lean(); // lean() so we can easily modify objects

    if (!servicesWithEngineer.length) {
        return res.status(200).json({
            success: true,
            count: 0,
            orders: [],
        });
    }

    // Step 2️⃣: Filter each service's workTypeDetails to include only that engineer
    const filteredServices = servicesWithEngineer.map((service) => {
        return {
            ...service,
            workTypeDetails: service.workTypeDetails.filter(
                (wt) =>
                    wt.engineer &&
                    wt.engineer.toString() === technicianId.toString()
            ),
        };
    });

    const serviceIds = filteredServices.map((s) => s._id);

    // Step 3️⃣: Find orders that include those services
    const orders = await orderModel
        .find({
            services: { $in: serviceIds },
        })
        .populate({
            path: "services",
            populate: {
                path: "workTypeDetails.engineer",
                model: "Employee",
            },
        })
        .populate("customer", "name email")
        .sort({ createdAt: -1 })
        .lean();

    // Step 4️⃣: Replace each service inside the order with the filtered one (only relevant workTypeDetails)
    const filteredOrders = orders.map((order) => {
        return {
            ...order,
            services: order.services.map((svc) => {
                const match = filteredServices.find(
                    (fs) => fs._id.toString() === svc._id.toString()
                );
                return match ? { ...svc, workTypeDetails: match.workTypeDetails } : svc;
            }),
        };
    });

    res.status(200).json({
        message: "Orders fetched successfully",
        count: filteredOrders.length,
        orders: filteredOrders,
    });
});
//     const { technicianId } = req.params;
//     if (!technicianId) {
//         return res.status(400).json({ message: 'technicianId is required' });
//     }

//     // Step 1: Find all services where this engineer is assigned
//     const servicesWithEngineer = await Services.find({
//         workTypeDetails: {
//             $elemMatch: {
//                 engineer: new mongoose.Types.ObjectId(technicianId),
//             },
//         },
//     });

//     const serviceIds = servicesWithEngineer.map((s) => s._id);

//     if (serviceIds.length === 0) {
//         return res.status(200).json({
//             success: true,
//             count: 0,
//             orders: []
//         });
//     }

//     // Step 2: Find orders that contain those services
//     let orders = await orderModel.find({
//         services: { $in: serviceIds },
//     })
//         .populate({
//             path: 'services',
//             populate: {
//                 path: 'workTypeDetails.engineer',
//                 model: 'Employee',
//             },
//         })
//         .populate('customer', 'name email')
//         .sort({ createdAt: -1 });

//     // Step 3: Filter workTypeDetails to only include "Quality Assurance Test"
//     orders = orders.map(order => {
//         const filteredServices = order.services.map(service => {
//             const qaWorkTypeDetails = service.workTypeDetails.filter(wt => wt.workType === "Quality Assurance Test");
//             return {
//                 ...service.toObject(),
//                 workTypeDetails: qaWorkTypeDetails
//             };
//         });
//         return {
//             ...order.toObject(),
//             services: filteredServices
//         };
//     });

//     res.status(200).json({
//         message: 'Orders fetched successfully',
//         count: orders.length,
//         orders,
//     });
// });



// const updateCompletedStatus = asyncHandler(async (req, res) => {
//     const { orderId, employeeId } = req.params;
//     if (!orderId || !employeeId) {
//         return res.status(400).json({ message: 'Order ID and Employee ID are required' });
//     }
//     const order = await orderModel.findById(orderId);
//     if (!order) {
//         return res.status(404).json({ message: 'Order not found' });
//     }
//     // Loop through services or assigned employees to update status
//     let updated = false;
//     for (const service of order.services || []) {
//         // if (service.assignedTo?.toString() === employeeId.toString()) {
//         service.status = 'Completed';
//         service.workTypeStatus = 'Completed';
//         // Generate and assign report numbers
//         service.tcReportNumber = generateULRReportNumber();
//         service.qaTestReportNumber = generateQATestReportNumber();
//         order.status = 'completed';
//         order.reportULRNumber = generateULRReportNumber();
//         order.qaTestReportNumber = generateQATestReportNumber();
//         // Increment sequence after generating
//         incrementSequence();
//         await order.save();
//         console.log("🚀 ~ order:", order)
//         updated = true;
//         // }
//     }
//     if (!updated) {
//         return res.status(400).json({ message: 'No matching employee assignment found in order' });
//     }
//     await order.save();
//     res.status(200).json({
//         message: 'Status updated and report numbers generated successfully',
//         reportULRNumber: order.reportULRNumber,
//         qaTestReportNumber: order.qaTestReportNumber
//     });
// });
//qa raw --assign engineer--check in postman



// const assignTechnicianByQARaw = asyncHandler(async (req, res) => {
//     try {
//         const { orderId, serviceId, technicianId, workType } = req.params;
//         // 1. Validate order and service relationship
//         const order = await orderModel.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         if (!order.services.includes(serviceId)) {
//             return res.status(400).json({ message: 'Service not linked to this order' });
//         }

//         // 2. Get the service
//         const service = await Services.findById(serviceId);
//         if (!service) {
//             return res.status(404).json({ message: 'Service not found' });
//         }

//         // 3. Validate engineer
//         const engineer = await Employee.findById(technicianId);
//         if (!engineer || engineer.technicianType !== 'engineer') {
//             return res.status(400).json({ message: 'Invalid engineer or not an engineer type' });
//         }

//         // 4. Find the specific workType and update only that
//         const work = service.workTypeDetails.find(w => w.workType === workType);
//         if (!work) {
//             return res.status(404).json({ message: `WorkType '${workType}' not found in service` });
//         }

//         work.engineer = technicianId;
//         work.status = 'in progress';

//         await service.save();

//         res.status(200).json({
//             message: `Engineer assigned successfully to workType '${workType}'`,
//             service,
//         });
//     } catch (error) {
//         console.error('Error assigning engineer:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });


const assignTechnicianByQARaw = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, technicianId, workType } = req.params;

        // 1. Validate order and service relationship
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.services.includes(serviceId)) {
            return res
                .status(400)
                .json({ message: "Service not linked to this order" });
        }

        // 2. Get the service
        const service = await Services.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // 3. Validate engineer
        const engineer = await Employee.findById(technicianId);
        if (!engineer || engineer.technicianType !== "engineer") {
            return res
                .status(400)
                .json({ message: "Invalid engineer or not an engineer type" });
        }

        // 4. Find and update the specific workType
        const work = service.workTypeDetails.find(
            (w) => w.workType === workType
        );

        if (!work) {
            return res
                .status(404)
                .json({ message: `WorkType '${workType}' not found in service` });
        }

        // ✅ Assign engineer and reset flags
        work.engineer = technicianId;
        work.status = "in progress";

        // ✅ Reset isSubmitted flag (important)
        work.isSubmitted = false;
        work.assignedAt = new Date();
        await service.save();

        res.status(200).json({
            message: `Engineer assigned successfully to workType '${workType}'`,
            assignedAt: work.assignedAt,
            service,
        });
    } catch (error) {
        console.error("Error assigning engineer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



//for qa test
// const assignOfficeStaffByQATest = asyncHandler(async (req, res) => {
//     try {
//         const { orderId, serviceId, officeStaffId, workType, status } = req.params; 
//         console.log("🚀 ~ officeStaffId:", officeStaffId);
//         console.log("🚀 ~ serviceId:", serviceId);
//         console.log("🚀 ~ orderId:", orderId);
//         console.log("🚀 ~ status:", status);
//         console.log("🚀 ~ workType:", workType);

//         // 1. Validate order
//         const order = await orderModel.findById(orderId);
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         if (!order.services.includes(serviceId)) {
//             return res.status(400).json({ message: 'Service not linked to this order' });
//         }

//         // 2. Validate service
//         const service = await Services.findById(serviceId);
//         if (!service) {
//             return res.status(404).json({ message: 'Service not found' });
//         }

//         // 3. Validate staff
//         const staff = await Employee.findById(officeStaffId);
//         if (!staff || staff.technicianType !== 'office-staff') {
//             return res.status(400).json({ message: 'Invalid staff or not an office staff type' });
//         }

//         // 4. Assign office staff to the given workType only
//         let updated = false;
//         service.workTypeDetails = service.workTypeDetails.map((work) => {
//             if (work.workType?.toLowerCase() === workType.toLowerCase()) {
//                 work.officeStaff = officeStaffId;
//                 work.status = status || work.status;
//                 updated = true;
//             }
//             return work;
//         });

//         if (!updated) {
//             return res.status(404).json({ message: `WorkType '${workType}' not found in this service` });
//         }

//         await service.save();

//         res.status(200).json({
//             message: `Office staff assigned successfully to workType '${workType}'`,
//             service,
//         });
//     } catch (error) {
//         console.error('Error assigning office staff:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });




//21-11
// const assignOfficeStaffByQATest = asyncHandler(async (req, res) => {
//     try {
//         const { orderId, serviceId, officeStaffId, workType, status } = req.params;

//         console.log("🚀 officeStaffId:", officeStaffId);
//         console.log("🚀 serviceId:", serviceId);
//         console.log("🚀 orderId:", orderId);
//         console.log("🚀 workType:", workType);
//         console.log("🚀 status:", status);

//         // 1️⃣ Validate order
//         const order = await orderModel.findById(orderId);
//         if (!order) return res.status(404).json({ message: 'Order not found' });

//         if (!order.services.includes(serviceId)) {
//             return res.status(400).json({ message: 'Service not linked to this order' });
//         }

//         // 2️⃣ Validate service
//         const service = await Services.findById(serviceId);
//         if (!service) return res.status(404).json({ message: 'Service not found' });

//         // 3️⃣ Validate office staff
//         const staff = await Employee.findById(officeStaffId);
//         if (!staff || staff.technicianType !== 'office-staff') {
//             return res.status(400).json({ message: 'Invalid staff or not an office staff type' });
//         }

//         // 4️⃣ Find workTypeDetail
//         const workDetail = service.workTypeDetails.find(
//             (w) => w.workType && w.workType.toLowerCase() === workType.toLowerCase()
//         );

//         if (!workDetail) {
//             return res.status(404).json({ message: `WorkType '${workType}' not found in this service` });
//         }

//         // 5️⃣ Create or update QATest subdocument
//         let qaTestDoc;
//         const assignedAtDate = new Date();

//         if (!workDetail.QAtest) {
//             qaTestDoc = await QATest.create({
//                 officeStaff: officeStaffId,
//                 assignedAt: assignedAtDate,
//             });
//             workDetail.QAtest = qaTestDoc._id;
//         } else {
//             qaTestDoc = await QATest.findByIdAndUpdate(
//                 workDetail.QAtest,
//                 { officeStaff: officeStaffId, assignedAt: assignedAtDate },
//                 { new: true }
//             );
//         }

//         // 6️⃣ Update workTypeDetail status
//         if (status) workDetail.status = status;

//         // 7️⃣ Save assigned date for office staff in workTypeDetails
//         workDetail.assignedAt = assignedAtDate;

//         // 8️⃣ Save service
//         await service.save();

//         res.status(200).json({
//             message: `Office staff assigned successfully to workType '${workType}'`,
//             assignedAt: assignedAtDate,
//             QATest: qaTestDoc,
//             service
//         });

//     } catch (error) {
//         console.error('Error assigning office staff:', error);
//         res.status(500).json({ message: 'Internal server error', error: error.message });
//     }
// });

const assignOfficeStaffByQATest = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, officeStaffId, workType, status } = req.params;

        console.log("officeStaffId:", officeStaffId);
        console.log("serviceId:", serviceId);
        console.log("orderId:", orderId);
        console.log("workType:", workType);
        console.log("status:", status);

        // 1. Validate order
        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (!order.services.includes(serviceId)) {
            return res.status(400).json({ message: 'Service not linked to this order' });
        }

        // 2. Validate service
        const service = await Services.findById(serviceId);
        if (!service) return res.status(404).json({ message: 'Service not found' });

        // 3. Validate office staff
        const staff = await Employee.findById(officeStaffId);
        if (!staff || staff.technicianType !== 'office-staff') {
            return res.status(400).json({ message: 'Invalid staff or not an office staff type' });
        }

        // 4. Find workTypeDetail
        const workDetail = service.workTypeDetails.find(
            (w) => w.workType && w.workType.toLowerCase() === workType.toLowerCase()
        );

        if (!workDetail) {
            return res.status(404).json({ message: `WorkType '${workType}' not found in this service` });
        }

        // 5. Create or update QATest subdocument
        let qaTestDoc;
        const assignedAtDate = new Date();

        if (!workDetail.QAtest) {
            qaTestDoc = await QATest.create({
                officeStaff: officeStaffId,
                assignedAt: assignedAtDate,
            });
            workDetail.QAtest = qaTestDoc._id;
        } else {
            qaTestDoc = await QATest.findByIdAndUpdate(
                workDetail.QAtest,
                { officeStaff: officeStaffId, assignedAt: assignedAtDate },
                { new: true }
            );
        }

        // 6. Update workTypeDetail status + PUSH TO HISTORY
        // if (status && status !== workDetail.status) {
        //     // Only push history if status actually changes
        //     const historyEntry = {
        //         oldStatus: workDetail.status || 'pending',  // fallback if somehow undefined
        //         newStatus: status,
        //         updatedBy: req.user.id,     
        //         updatedAt: new Date()
        //     };
        //     console.log("🚀 ~ historyEntry:", historyEntry)

        //     // Initialize array if not exists (safety)
        //     if (!workDetail.statusHistory) {
        //         workDetail.statusHistory = [];
        //     }

        //     workDetail.statusHistory.push(historyEntry);
        //     workDetail.status = status; // now update status
        // }



        // 6. Update workTypeDetail status + PUSH TO HISTORY
        if (status && status !== workDetail.status) {
            const historyEntry = {
                oldStatus: workDetail.status || "pending",
                newStatus: status,
                updatedBy: {
                    _id: req.user.id,
                    name: req.user.name || req.user.email || "Unknown",
                    role: req.user.role || "system"
                },
                updatedAt: new Date()
            };


            if (!workDetail.statusHistory) {
                workDetail.statusHistory = [];
            }

            workDetail.statusHistory.push(historyEntry);
            workDetail.status = status;
        }

        // 7. Save assigned date for office staff in workTypeDetails
        workDetail.assignedAt = assignedAtDate;

        // 8. Save service
        await service.save();

        res.status(200).json({
            message: `Office staff assigned successfully to workType '${workType}'`,
            assignedAt: assignedAtDate,
            QATest: qaTestDoc,
            service
        });

    } catch (error) {
        console.error('Error assigning office staff:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});






// const completedStatusAndReport = asyncHandler(async (req, res) => {
//     try {
//         const { staffId, orderId, serviceId, workType, status, reportType } = req.params;

//         if (!req.file && ["completed", "generated"].includes(status.toLowerCase())) {
//             return res.status(400).json({ message: "File is required for completed status" });
//         }

//         // Normalize reportType
//         // let normalizedReportType = reportType?.toLowerCase().trim();
//         // if (["qa test", "qatest", "quality assurance test"].includes(normalizedReportType)) {
//         //     normalizedReportType = "qatest";
//         //     console.log("🚀 ~ normalizedReportType:", normalizedReportType)
//         // } else if (["License for Operation","Decommissioning","Decommissioning and Recommissioning"].includes(normalizedReportType)) {
//         //     normalizedReportType = "elora";
//         //     console.log("🚀 ~ normalizedReportType:", normalizedReportType)
//         // }
//         let normalizedReportType = reportType?.toLowerCase().trim();
//         if (["qa test", "qatest", "quality assurance test"].includes(normalizedReportType)) {
//             normalizedReportType = "qatest";
//             console.log("🚀 ~ normalizedReportType:", normalizedReportType)
//         } else {
//             // ✅ Fix: Lowercase the check array for case-insensitive matching
//             const eloraTypes = ["license for operation", "decommissioning", "decommissioning and recommissioning"];
//             if (eloraTypes.includes(normalizedReportType)) {
//                 normalizedReportType = "elora";
//                 console.log("🚀 ~ normalizedReportType:", normalizedReportType)
//             }
//         }
//         const service = await Services.findById(serviceId);
//         if (!service) return res.status(404).json({ message: "Service not found" });

//         let updated = false;
//         let newReportDoc = null;
//         let reportFor = null;

//         // ✅ Check for "paid" status and verify payment
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             const payment = await Payment.findOne({ orderId });
//             if (!order || !payment || payment.paymentType !== "complete") {
//                 return res.status(400).json({
//                     message: "Cannot mark as paid. Payment is not complete or order not found.",
//                 });
//             }
//         }

//         // ✅ Loop through workTypeDetails
//         service.workTypeDetails = await Promise.all(
//             service.workTypeDetails.map(async (work) => {
//                 if (work.workType?.toLowerCase() !== workType.toLowerCase()) return work;

//                 let existingReport = null;
//                 if (normalizedReportType === "qatest" && work.QAtest) {
//                     existingReport = await QATest.findById(work.QAtest);
//                 } else if (normalizedReportType === "elora" && work.elora) {
//                     existingReport = await Elora.findById(work.elora);
//                 }

//                 // ✅ Upload file to S3 (if provided)
//                 let fileUrl = null;
//                 console.log("🚀 ~ req.file:", req.file)
//                 if (req.file) {
//                     try {
//                         const uploaded = await uploadToS3(req.file);
//                         fileUrl = uploaded.url;
//                     } catch (err) {
//                         return res.status(500).json({ message: "Failed to upload file" });
//                     }
//                 }

//                 // ✅ Update work status (for QA Test only)
//                 if (normalizedReportType !== "elora") {
//                     work.status = status;
//                 }

//                 // ✅ Handle QA Test report logic
//                 if (normalizedReportType === "qatest") {
//                     if (existingReport) {
//                         // 🔹 Keep report numbers — only update file/status
//                         const updateData = { reportStatus: existingReport.reportStatus };
//                         if (fileUrl) updateData.report = fileUrl;

//                         // If rejected, mark as reuploaded
//                         if (existingReport.reportStatus === "rejected") {
//                             updateData.reportStatus = "reuploaded";
//                         } else if (status.toLowerCase() === "completed") {
//                             updateData.reportStatus = "pending";
//                         }

//                         newReportDoc = await QATest.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         // 🔹 Only create new QA Test if missing entirely
//                         newReportDoc = await QATest.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.QAtest = newReportDoc._id;
//                     }

//                     reportFor = "qatest";
//                 }

//                 // ✅ Handle Elora report logic
//                 else if (normalizedReportType === "elora") {
//                     console.log("🚀 ~ existingReport:", existingReport)
//                     if (existingReport) {
//                         const updateData = {};
//                         console.log("🚀 ~ fileUrl:", fileUrl)
//                         if (fileUrl) updateData.report = fileUrl;
//                         newReportDoc = await Elora.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await Elora.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         console.log("🚀 ~ newReportDoc:", newReportDoc)
//                         work.elora = newReportDoc._id;
//                     }

//                     reportFor = "elora";
//                 }

//                 updated = true;
//                 return work;
//             })
//         );

//         if (!updated) {
//             return res.status(404).json({
//                 message: `WorkType '${workType}' not assigned in this service`,
//             });
//         }

//         await service.save();

//         // ✅ Update order status if paid
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (order) {
//                 order.status = "paid";
//                 await order.save();
//             }
//         }

//         res.status(200).json({
//             message: `Status for workType '${workType}' updated successfully`,
//             linkedReport: newReportDoc || null,
//             reportId: newReportDoc?._id || null,
//             reportFor,
//             service,
//         });
//     } catch (error) {
//         console.error("Error in completedStatusAndReport:", error);
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// });






// export const


// const completedStatusAndReport = asyncHandler(async (req, res) => {
//     try {
//         const { staffId, orderId, serviceId, workType, status, reportType } = req.params;

//         if (!req.file && ["completed", "generated"].includes(status.toLowerCase())) {
//             return res.status(400).json({ message: "File is required for completed status" });
//         }

//         // ✅ Normalize reportType
//         let normalizedReportType = reportType?.toLowerCase().trim();
//         if (["qa test", "qatest", "quality assurance test"].includes(normalizedReportType)) {
//             normalizedReportType = "qatest";
//         } else {
//             const eloraTypes = ["license for operation", "decommissioning", "decommissioning and recommissioning"];
//             if (eloraTypes.includes(normalizedReportType)) {
//                 normalizedReportType = "elora";
//             }
//         }

//         const service = await Services.findById(serviceId);
//         if (!service) return res.status(404).json({ message: "Service not found" });

//         let updated = false;
//         let newReportDoc = null;
//         let reportFor = null;

//         // ✅ Handle "paid" status
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (!order) {
//                 return res.status(404).json({ message: "Order not found." });
//             }

//             // 🔹 Check if leadOwner is a Dealer
//             const leadOwner = await User.findOne({ _id: order.leadOwner }).lean();
//             const isDealer = leadOwner?.role === "Dealer"; // ✅ Dealer discriminator check

//             // 🔹 Only check payment if NOT a dealer
//             if (!isDealer) {
//                 const payment = await Payment.findOne({ orderId });
//                 if (!payment || payment.paymentType !== "complete") {
//                     return res.status(400).json({
//                         message: "Cannot mark as paid. Payment is not complete or order not found.",
//                     });
//                 }
//             }
//         }

//         // ✅ Loop through workTypeDetails
//         service.workTypeDetails = await Promise.all(
//             service.workTypeDetails.map(async (work) => {
//                 if (work.workType?.toLowerCase() !== workType.toLowerCase()) return work;

//                 let existingReport = null;
//                 if (normalizedReportType === "qatest" && work.QAtest) {
//                     existingReport = await QATest.findById(work.QAtest);
//                 } else if (normalizedReportType === "elora" && work.elora) {
//                     existingReport = await Elora.findById(work.elora);
//                 }

//                 // ✅ Upload file if present
//                 let fileUrl = null;
//                 if (req.file) {
//                     try {
//                         const uploaded = await uploadToS3(req.file);
//                         fileUrl = uploaded.url;
//                     } catch (err) {
//                         return res.status(500).json({ message: "Failed to upload file" });
//                     }
//                 }

//                 if (normalizedReportType !== "elora") {
//                     work.status = status;
//                 }

//                 // ✅ Handle QA Test
//                 if (normalizedReportType === "qatest") {
//                     if (existingReport) {
//                         const updateData = { reportStatus: existingReport.reportStatus };
//                         if (fileUrl) updateData.report = fileUrl;

//                         if (existingReport.reportStatus === "rejected") {
//                             updateData.reportStatus = "reuploaded";
//                         } else if (status.toLowerCase() === "completed") {
//                             updateData.reportStatus = "pending";
//                         }

//                         newReportDoc = await QATest.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await QATest.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.QAtest = newReportDoc._id;
//                     }

//                     reportFor = "qatest";
//                 }

//                 // ✅ Handle Elora
//                 else if (normalizedReportType === "elora") {
//                     if (existingReport) {
//                         const updateData = {};
//                         if (fileUrl) updateData.report = fileUrl;
//                         newReportDoc = await Elora.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await Elora.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.elora = newReportDoc._id;
//                     }

//                     reportFor = "elora";
//                 }

//                 updated = true;
//                 return work;
//             })
//         );

//         if (!updated) {
//             return res.status(404).json({
//                 message: `WorkType '${workType}' not assigned in this service`,
//             });
//         }

//         await service.save();

//         // ✅ Update order status if paid
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (order) {
//                 order.status = "paid";
//                 await order.save();
//             }
//         }

//         res.status(200).json({
//             message: `Status for workType '${workType}' updated successfully`,
//             linkedReport: newReportDoc || null,
//             reportId: newReportDoc?._id || null,
//             reportFor,
//             service,
//         });
//     } catch (error) {
//         console.error("Error in completedStatusAndReport:", error);
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// });


// const completedStatusAndReport = asyncHandler(async (req, res) => {
//     try {
//         const { staffId, orderId, serviceId, workType, status, reportType } = req.params;

//         if (!req.file && ["completed", "generated"].includes(status.toLowerCase())) {
//             return res.status(400).json({ message: "File is required for completed status" });
//         }

//         // Normalize reportType
//         let normalizedReportType = reportType?.toLowerCase().trim();
//         if (["qa test", "qatest", "quality assurance test"].includes(normalizedReportType)) {
//             normalizedReportType = "qatest";
//         } else {
//             const eloraTypes = ["license for operation", "decommissioning", "decommissioning and recommissioning"];
//             if (eloraTypes.includes(normalizedReportType)) {
//                 normalizedReportType = "elora";
//             }
//         }

//         const service = await Services.findById(serviceId);
//         if (!service) return res.status(404).json({ message: "Service not found" });

//         let updated = false;
//         let newReportDoc = null;
//         let reportFor = null;

//         // Handle "paid" status
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (!order) return res.status(404).json({ message: "Order not found." });

//             const leadOwner = await User.findOne({ _id: order.leadOwner }).lean();
//             const isDealer = leadOwner?.role === "Dealer";

//             if (!isDealer) {
//                 const payment = await Payment.findOne({ orderId });
//                 if (!payment || payment.paymentType !== "complete") {
//                     return res.status(400).json({
//                         message: "Cannot mark as paid. Payment is not complete.",
//                     });
//                 }
//             }
//         }

//         // Loop through workTypeDetails
//         service.workTypeDetails = await Promise.all(
//             service.workTypeDetails.map(async (work) => {
//                 if (work.workType?.toLowerCase() !== workType.toLowerCase()) return work;

//                 let existingReport = null;
//                 if (normalizedReportType === "qatest" && work.QAtest) {
//                     existingReport = await QATest.findById(work.QAtest);
//                 } else if (normalizedReportType === "elora" && work.elora) {
//                     existingReport = await Elora.findById(work.elora);
//                 }

//                 // Upload file
//                 let fileUrl = null;
//                 if (req.file) {
//                     try {
//                         const uploaded = await uploadToS3(req.file);
//                         fileUrl = uploaded.url;
//                     } catch {
//                         return res.status(500).json({ message: "Failed to upload file" });
//                     }
//                 }

//                 if (normalizedReportType !== "elora") {
//                     work.status = status;
//                 }

//                 // ⭐⭐⭐ NEW: SAVE WORKTYPE COMPLETION TIME ⭐⭐⭐
//                 if (status.toLowerCase() === "completed" || "generated") {
//                     work.completedAt = new Date();
//                 }

//                 // Handle QA Test
//                 if (normalizedReportType === "qatest") {
//                     if (existingReport) {
//                         const updateData = { reportStatus: existingReport.reportStatus };
//                         if (fileUrl) updateData.report = fileUrl;

//                         if (existingReport.reportStatus === "rejected") {
//                             updateData.reportStatus = "reuploaded";
//                         } else if (status.toLowerCase() === "completed") {
//                             updateData.reportStatus = "pending";
//                         }

//                         newReportDoc = await QATest.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await QATest.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.QAtest = newReportDoc._id;
//                     }

//                     reportFor = "qatest";
//                 }

//                 // Handle Elora
//                 else if (normalizedReportType === "elora") {
//                     const updateData = fileUrl ? { report: fileUrl } : {};

//                     if (existingReport) {
//                         newReportDoc = await Elora.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await Elora.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.elora = newReportDoc._id;
//                     }

//                     reportFor = "elora";
//                 }

//                 updated = true;
//                 return work;
//             })
//         );

//         if (!updated) {
//             return res.status(404).json({
//                 message: `WorkType '${workType}' not assigned in this service`,
//             });
//         }

//         await service.save();

//         // ⭐⭐⭐ NEW: SAVE ORDER COMPLETION TIMESTAMP ⭐⭐⭐
//         if (status.toLowerCase() === "completed") {
//             const order = await orderModel.findById(orderId);
//             if (order) {
//                 order.completedAt = new Date();
//                 await order.save();
//             }
//         }

//         // Update order if paid
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (order) {
//                 order.status = "paid";
//                 await order.save();
//             }
//         }

//         res.status(200).json({
//             message: `Status for workType '${workType}' updated successfully`,
//             linkedReport: newReportDoc || null,
//             reportId: newReportDoc?._id || null,
//             reportFor,
//             service,
//         });
//     } catch (error) {
//         console.error("Error in completedStatusAndReport:", error);
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// });


// const completedStatusAndReport = asyncHandler(async (req, res) => {
//     try {
//         const { staffId, orderId, serviceId, workType, status, reportType } = req.params;

//         if (!req.file && ["completed", "generated"].includes(status.toLowerCase())) {
//             return res.status(400).json({ message: "File is required for completed status" });
//         }

//         // Normalize reportType
//         let normalizedReportType = reportType?.toLowerCase().trim();
//         if (["qa test", "qatest", "quality assurance test"].includes(normalizedReportType)) {
//             normalizedReportType = "qatest";
//         } else {
//             const eloraTypes = ["license for operation", "decommissioning", "decommissioning and recommissioning"];
//             if (eloraTypes.includes(normalizedReportType)) {
//                 normalizedReportType = "elora";
//             }
//         }

//         const service = await Services.findById(serviceId);
//         if (!service) return res.status(404).json({ message: "Service not found" });

//         let updated = false;
//         let newReportDoc = null;
//         let reportFor = null;

//         // Handle "paid" status
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (!order) return res.status(404).json({ message: "Order not found." });

//             const leadOwner = await User.findOne({ _id: order.leadOwner }).lean();
//             const isDealer = leadOwner?.role === "Dealer";

//             if (!isDealer) {
//                 const payment = await Payment.findOne({ orderId });
//                 if (!payment || payment.paymentType !== "complete") {
//                     return res.status(400).json({
//                         message: "Cannot mark as paid. Payment is not complete.",
//                     });
//                 }
//             }
//         }

//         // Loop through workTypeDetails
//         service.workTypeDetails = await Promise.all(
//             service.workTypeDetails.map(async (work) => {
//                 if (work.workType?.toLowerCase() !== workType.toLowerCase()) return work;

//                 let existingReport = null;
//                 if (normalizedReportType === "qatest" && work.QAtest) {
//                     existingReport = await QATest.findById(work.QAtest);
//                 } else if (normalizedReportType === "elora" && work.elora) {
//                     existingReport = await Elora.findById(work.elora);
//                 }

//                 // Upload file
//                 let fileUrl = null;
//                 if (req.file) {
//                     try {
//                         const uploaded = await uploadToS3(req.file);
//                         fileUrl = uploaded.url;
//                     } catch {
//                         return res.status(500).json({ message: "Failed to upload file" });
//                     }
//                 }

//                 // OLD STATUS (before change)
//                 const oldStatus = work.status || "pending";

//                 // APPLY NEW STATUS
//                 if (normalizedReportType !== "elora") {
//                     work.status = status;
//                 }

//                 // SET COMPLETED TIME
//                 if (["completed", "generated"].includes(status.toLowerCase())) {
//                     work.completedAt = new Date();
//                 }

//                 // ADD STATUS HISTORY ENTRY (This is the only new part)
//                 const historyEntry = {
//                     oldStatus,
//                     newStatus: status.toLowerCase(),
//                     updatedBy: staffId, // Current staff who made the change
//                     updatedAt: new Date(),
//                 };

//                 // Initialize statusHistory if not exists
//                 if (!work.statusHistory) {
//                     work.statusHistory = [];
//                 }
//                 work.statusHistory.push(historyEntry);

//                 // Handle QA Test
//                 if (normalizedReportType === "qatest") {
//                     if (existingReport) {
//                         const updateData = { reportStatus: existingReport.reportStatus };
//                         if (fileUrl) updateData.report = fileUrl;

//                         if (existingReport.reportStatus === "rejected") {
//                             updateData.reportStatus = "reuploaded";
//                         } else if (status.toLowerCase() === "completed") {
//                             updateData.reportStatus = "pending";
//                         }

//                         newReportDoc = await QATest.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await QATest.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.QAtest = newReportDoc._id;
//                     }

//                     reportFor = "qatest";
//                 }

//                 // Handle Elora
//                 else if (normalizedReportType === "elora") {
//                     const updateData = fileUrl ? { report: fileUrl } : {};

//                     if (existingReport) {
//                         newReportDoc = await Elora.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await Elora.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.elora = newReportDoc._id;
//                     }

//                     reportFor = "elora";
//                 }

//                 updated = true;
//                 return work;
//             })
//         );

//         if (!updated) {
//             return res.status(404).json({
//                 message: `WorkType '${workType}' not assigned in this service`,
//             });
//         }

//         await service.save();

//         // Order completion timestamp
//         if (status.toLowerCase() === "completed") {
//             const order = await orderModel.findById(orderId);
//             if (order) {
//                 order.completedAt = new Date();
//                 await order.save();
//             }
//         }

//         // Update order if paid
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (order) {
//                 order.status = "paid";
//                 await order.save();
//             }
//         }

//         res.status(200).json({
//             message: `Status for workType '${workType}' updated successfully`,
//             linkedReport: newReportDoc || null,
//             reportId: newReportDoc?._id || null,
//             reportFor,
//             service,
//         });
//     } catch (error) {
//         console.error("Error in completedStatusAndReport:", error);
//         res.status(500).json({ message: error.message || "Server error" });
//     }
// });


// export const completedStatusAndReport = asyncHandler(async (req, res) => {
//     try {
//         const { staffId, orderId, serviceId, workType, status, reportType } = req.params;
//         console.log("staff id", staffId, "order id", orderId, "service id", serviceId, "work type", workType, "status", status, "report type", reportType);
//         // 🔒 File validation
//         if (!req.file && ["completed", "generated"].includes(status.toLowerCase())) {
//             return res.status(400).json({ message: "File is required for completed status" });
//         }

//         // 🔁 Normalize reportType
//         let normalizedReportType = reportType?.toLowerCase().trim();
//         if (["qa test", "qatest", "quality assurance test"].includes(normalizedReportType)) {
//             normalizedReportType = "qatest";
//         } else if (
//             ["license for operation", "decommissioning", "decommissioning and recommissioning"]
//                 .includes(normalizedReportType)
//         ) {
//             normalizedReportType = "elora";
//         }

//         const service = await Services.findById(serviceId);
//         if (!service) return res.status(404).json({ message: "Service not found" });

//         let updated = false;
//         let newReportDoc = null;
//         let reportFor = null;

//         // 💰 Paid status validation
//         if (status.toLowerCase() === "paid") {
//             const order = await orderModel.findById(orderId);
//             if (!order) return res.status(404).json({ message: "Order not found" });

//             const leadOwner = await User.findById(order.leadOwner).lean();
//             if (leadOwner?.role !== "Dealer") {
//                 const payment = await Payment.findOne({ orderId });
//                 if (!payment || payment.paymentType !== "complete") {
//                     return res.status(400).json({
//                         message: "Cannot mark as paid. Payment not completed",
//                     });
//                 }
//             }
//         }

//         // 🔄 Process workTypeDetails
//         service.workTypeDetails = await Promise.all(
//             service.workTypeDetails.map(async (work) => {
//                 if (work.workType?.toLowerCase() !== workType.toLowerCase()) return work;

//                 let existingReport = null;

//                 if (normalizedReportType === "qatest" && work.QAtest) {
//                     existingReport = await QATest.findById(work.QAtest);
//                 }
//                 if (normalizedReportType === "elora" && work.elora) {
//                     existingReport = await Elora.findById(work.elora);
//                 }

//                 // ☁ Upload file
//                 let fileUrl = null;
//                 if (req.file) {
//                     const uploaded = await uploadToS3(req.file);
//                     fileUrl = uploaded.url;
//                 }

//                 const oldStatus = work.status || "pending";

//                 // ⏱ Status update
//                 if (normalizedReportType !== "elora") {
//                     work.status = status.toLowerCase();
//                 }

//                 if (["completed", "generated"].includes(status.toLowerCase())) {
//                     work.completedAt = new Date();
//                 }

//                 // ✅ FIX: SYSTEM vs USER HISTORY
//                 const isSystemUpdate = !staffId;
//                 console.log("isSystemUpdate", isSystemUpdate);
//                 const historyEntry = {
//                     oldStatus,
//                     newStatus: status.toLowerCase(),
//                     updatedBy: isSystemUpdate
//                         ? null
//                         : new mongoose.Types.ObjectId(staffId),
//                     updatedAt: new Date(),
//                 };

//                 if (!work.statusHistory) work.statusHistory = [];
//                 work.statusHistory.push(historyEntry);

//                 // 📄 QA TEST
//                 if (normalizedReportType === "qatest") {
//                     if (existingReport) {
//                         const updateData = {};
//                         if (fileUrl) updateData.report = fileUrl;

//                         if (existingReport.reportStatus === "rejected") {
//                             updateData.reportStatus = "reuploaded";
//                         } else if (status.toLowerCase() === "completed") {
//                             updateData.reportStatus = "pending";
//                         }

//                         newReportDoc = await QATest.findByIdAndUpdate(
//                             existingReport._id,
//                             updateData,
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await QATest.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.QAtest = newReportDoc._id;
//                     }
//                     reportFor = "qatest";
//                 }

//                 // 📄 ELORA
//                 if (normalizedReportType === "elora") {
//                     if (existingReport) {
//                         newReportDoc = await Elora.findByIdAndUpdate(
//                             existingReport._id,
//                             fileUrl ? { report: fileUrl } : {},
//                             { new: true }
//                         );
//                     } else if (fileUrl) {
//                         newReportDoc = await Elora.create({
//                             officeStaff: staffId,
//                             report: fileUrl,
//                             reportStatus: "pending",
//                         });
//                         work.elora = newReportDoc._id;
//                     }
//                     reportFor = "elora";
//                 }

//                 updated = true;
//                 return work;
//             })
//         );

//         if (!updated) {
//             return res.status(404).json({
//                 message: `WorkType '${workType}' not found in this service`,
//             });
//         }

//         await service.save();

//         // 🕒 Order completion timestamp
//         if (status.toLowerCase() === "completed") {
//             await orderModel.findByIdAndUpdate(orderId, {
//                 completedAt: new Date(),
//             });
//         }

//         // 💰 Paid update
//         if (status.toLowerCase() === "paid") {
//             await orderModel.findByIdAndUpdate(orderId, { status: "paid" });
//         }

//         res.status(200).json({
//             success: true,
//             message: `Status '${status}' updated successfully`,
//             reportFor,
//             reportId: newReportDoc?._id || null,
//             linkedReport: newReportDoc || null,
//             service,
//         });
//     } catch (error) {
//         console.error("completedStatusAndReport error:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal server error",
//         });
//     }
// });


export const completedStatusAndReport = asyncHandler(async (req, res) => {
    try {
        const { staffId, orderId, serviceId, workType, status, reportType } = req.params;

        console.log(
            "staffId:", staffId,
            "orderId:", orderId,
            "serviceId:", serviceId,
            "workType:", workType,
            "status:", status,
            "reportType:", reportType
        );

        // 🔒 File validation
        if (!req.file && ["completed", "generated"].includes(status.toLowerCase())) {
            return res.status(400).json({ message: "File is required" });
        }

        // 🔁 Normalize reportType
        let normalizedReportType = reportType?.toLowerCase().trim();
        if (["qa test", "qatest", "quality assurance test"].includes(normalizedReportType)) {
            normalizedReportType = "qatest";
        } else if (
            ["license for operation", "decommissioning", "decommissioning and recommissioning"]
                .includes(normalizedReportType)
        ) {
            normalizedReportType = "elora";
        }

        const service = await Services.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        let updated = false;
        let newReportDoc = null;
        let reportFor = null;

        // 💰 Paid validation
        if (status.toLowerCase() === "paid") {
            const order = await orderModel.findById(orderId);
            if (!order) return res.status(404).json({ message: "Order not found" });

            const leadOwner = await User.findById(order.leadOwner).lean();
            if (leadOwner?.role !== "Dealer") {
                const payment = await Payment.findOne({ orderId });
                if (!payment || payment.paymentType !== "complete") {
                    return res.status(400).json({
                        message: "Payment not completed",
                    });
                }
            }
        }

        // 🔄 Update workTypeDetails
        service.workTypeDetails = await Promise.all(
            service.workTypeDetails.map(async (work) => {
                if (work.workType?.toLowerCase() !== workType.toLowerCase()) return work;

                let existingReport = null;

                if (normalizedReportType === "qatest" && work.QAtest) {
                    existingReport = await QATest.findById(work.QAtest);
                }
                if (normalizedReportType === "elora" && work.elora) {
                    existingReport = await Elora.findById(work.elora);
                }

                // ☁ Upload file
                let fileUrl = null;
                if (req.file) {
                    const uploaded = await uploadToS3(req.file);
                    fileUrl = uploaded.url;
                }

                const oldStatus = work.status || "pending";
                const newStatus = status.toLowerCase();

                // ✅ Update status (Always update status now)
                work.status = newStatus;

                if (["completed", "generated"].includes(newStatus)) {
                    work.completedAt = new Date();
                }

                // 🔥 BUILD updatedBy OBJECT (MATCHES SCHEMA)
                let updatedBy = null;

                if (staffId) {
                    const staff = await User.findById(staffId)
                        .select("name role")
                        .lean();

                    if (staff) {
                        updatedBy = {
                            _id: staff._id.toString(), // STRING (schema expects string)
                            name: staff.name,
                            role: staff.role
                        };
                    }
                }

                // 🧾 STATUS HISTORY
                if (!work.statusHistory) work.statusHistory = [];

                work.statusHistory.push({
                    oldStatus,
                    newStatus,
                    updatedBy, // ✅ OBJECT, not ObjectId
                    updatedAt: new Date()
                });

                // 📄 QA TEST
                if (normalizedReportType === "qatest") {
                    if (existingReport) {
                        const updateData = {};
                        if (fileUrl) updateData.report = fileUrl;

                        if (existingReport.reportStatus === "rejected") {
                            updateData.reportStatus = "reuploaded";
                        } else if (newStatus === "completed") {
                            updateData.reportStatus = "pending";
                        }

                        newReportDoc = await QATest.findByIdAndUpdate(
                            existingReport._id,
                            updateData,
                            { new: true }
                        );
                    } else if (fileUrl) {
                        newReportDoc = await QATest.create({
                            officeStaff: staffId,
                            report: fileUrl,
                            reportStatus: "pending",
                        });
                        work.QAtest = newReportDoc._id;
                    }
                    reportFor = "qatest";
                }

                // 📄 ELORA
                if (normalizedReportType === "elora") {
                    if (existingReport) {
                        newReportDoc = await Elora.findByIdAndUpdate(
                            existingReport._id,
                            fileUrl ? { report: fileUrl } : {},
                            { new: true }
                        );
                    } else if (fileUrl) {
                        newReportDoc = await Elora.create({
                            officeStaff: staffId,
                            report: fileUrl,
                            reportStatus: "pending",
                        });
                        work.elora = newReportDoc._id;
                    }
                    reportFor = "elora";
                }

                updated = true;
                return work;
            })
        );

        if (!updated) {
            return res.status(404).json({
                message: `WorkType '${workType}' not found in this service`,
            });
        }

        await service.save();

        // 🕒 Order completion
        if (status.toLowerCase() === "completed") {
            await orderModel.findByIdAndUpdate(orderId, {
                completedAt: new Date(),
            });
        }

        // 💰 Paid update
        if (status.toLowerCase() === "paid") {
            await orderModel.findByIdAndUpdate(orderId, {
                status: "paid",
            });
        }

        return res.status(200).json({
            success: true,
            message: `Status '${status}' updated successfully`,
            reportFor,
            reportId: newReportDoc?._id || null,
            linkedReport: newReportDoc || null,
            service,
        });

    } catch (error) {
        console.error("completedStatusAndReport error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
});

const getRawDetailsByTechnician = asyncHandler(async (req, res) => {
    try {

    } catch (error) {

    }
})
const getQaDetails = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, technicianId } = req.params;
        console.log("🚀 ~ engineerId:", technicianId)
        console.log("🚀 ~ serviceId:", serviceId)
        console.log("🚀 ~ orderId:", orderId)

        // Step 1: Find the order with populated services and engineers
        const order = await orderModel.findById(orderId)
            .populate({
                path: 'services',
                populate: {
                    path: 'workTypeDetails.engineer',
                    model: 'Employee'
                }
            });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Step 2: Find the specific service by serviceId
        const service = order.services.find(s => s._id.toString() === serviceId);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Step 3: Find work assigned to the engineer
        const engineerWork = service.workTypeDetails.find(work =>
            work.engineer?._id?.toString() === technicianId
        );
        if (!engineerWork) {
            return res.status(404).json({ message: 'No work found for this engineer' });
        }

        // Step 4: Construct response
        const response = {
            engineerName: engineerWork.engineer?.name || 'N/A',
            machineModel: service.machineModel || 'N/A',
            serialNumber: service.serialNumber || 'N/A',
            rawPhoto: engineerWork.viewFile || 'N/A',
            rawFile: engineerWork.uploadFile || 'N/A',
            remark: engineerWork.remark || 'N/A'
        };

        return res.status(200).json(response);

    } catch (error) {
        console.error("Error fetching QA details:", error);
        res.status(500).json({ message: 'Server error' });
    }
});

const getAllOfficeStaff = async (req, res) => {
    try {
        const officeStaff = await Employee.find({ technicianType: 'office staff' }).select('name');
        res.status(200).json({ success: true, data: officeStaff });
    } catch (error) {
        console.error("Error fetching office staff:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateStaffStatus = asyncHandler(async (req, res) => {
    try {

    } catch (error) {

    }
})

const uploadReportByOfficeStaff = asyncHandler(async (req, res) => {
    try {

    } catch (error) {

    }
})

const getAssignedTechnicianName = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, workType } = req.params;

        // 1. Validate the order contains the service
        const order = await orderModel.findById(orderId).populate({
            path: 'services',
            match: { _id: serviceId },
            populate: {
                path: 'workTypeDetails.engineer',
                select: '_id name'
            }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const service = order.services[0];
        if (!service) {
            return res.status(404).json({ message: 'Service not found in this order' });
        }

        // 2. Find the workType entry
        const workDetail = service.workTypeDetails.find(
            w => w.workType === workType
        );

        if (!workDetail) {
            return res.status(404).json({ message: 'Work type not found in this service' });
        }

        if (!workDetail.engineer) {
            return res.status(404).json({ message: 'No technician assigned for this work type' });
        }

        // 3. Return the technician's name
        res.status(200).json({
            success: true,
            technicianId: workDetail.engineer._id,
            technicianName: workDetail.engineer.name,
            status: workDetail.status
        });
    } catch (error) {
        console.error('Error fetching technician name:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



const getAssignedOfficeStaffName = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, workType } = req.params;

        // 1️⃣ Populate services → workTypeDetails → QAtest → officeStaff
        const order = await orderModel.findById(orderId).populate({
            path: "services",
            match: { _id: serviceId },
            populate: {
                path: "workTypeDetails.QAtest",   // populate QATest first
                populate: {
                    path: "officeStaff",          // then populate officeStaff inside QATest
                    select: "name"
                }
            }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const service = order.services[0];
        if (!service) {
            return res.status(404).json({ message: "Service not found in this order" });
        }

        // 2️⃣ Find workType entry
        const workDetail = service.workTypeDetails.find(
            w => w.workType === workType
        );

        if (!workDetail) {
            return res.status(404).json({ message: "Work type not found in this service" });
        }

        if (!workDetail.QAtest || !workDetail.QAtest.officeStaff) {
            return res.status(404).json({ message: "No office staff assigned for this work type" });
        }

        // 3️⃣ Return office staff name
        res.status(200).json({
            success: true,
            officeStaffName: workDetail.QAtest.officeStaff.name,
            status: workDetail.status
        });

    } catch (error) {
        console.error("Error fetching office staff name:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


export const getOrders = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params
    } catch (error) {
        console.error("error ", error.message[0])
    }
})
export const editOrder = async (req, res) => {
    try {

    } catch (error) {

    }
}

// export const paidStatus = asyncHandler(async (req, res) => {
//     try {
//         const { orderId, serviceId, customerId, status } = req.body
//         const order=orderModel.findById(_id:orderId)

//     } catch (error) {

//     }
// })



// Update Additional Service
// export const updateAdditionalService = async (req, res) => {
//     try {
//         const { id } = req.params; // service ID from URL
//         const { status, remark } = req.body; // values from fronten
//         if (!id) {
//             return res.status(400).json({ message: "Service ID is required" });
//         }
//         const updatedService = await AdditionalService.findByIdAndUpdate(
//             id,
//             { status, remark },
//             { new: true, runValidators: true }
//         );
//         if (!updatedService) {
//             return res.status(404).json({ message: "Service not found" });
//         }
//         res.status(200).json({
//             message: "Additional Service updated successfully",
//             service: updatedService,
//         });
//     } catch (error) {
//         console.error("Error updating additional service:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };




// const updateAdditionalService = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const status = req.body?.status;
//         const remark = req.body?.remark;

//         if (!id) {
//             return res.status(400).json({ message: "Service ID is required" });
//         }

//         // Status is mandatory
//         if (!status) {
//             return res.status(400).json({ message: "Status is required" });
//         }

//         const service = await AdditionalService.findById(id);
//         if (!service) {
//             return res.status(404).json({ message: "Service not found" });
//         }

//         // If status is completed, file upload is mandatory
//         if (status.toLowerCase() === "completed") {
//             if (!req.file) {
//                 return res.status(400).json({ message: "File upload is required when status is 'completed'" });
//             }
//             const { url } = await uploadToS3(req.file);
//             service.report = url; // store the file URL
//         }

//         service.status = status;
//         service.remark = remark || service.remark;

//         await service.save();

//         res.status(200).json({
//             message: "Additional Service updated successfully",
//             service,       // report URL is now included
//         });
//     } catch (error) {
//         console.error("Error updating additional service:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// };
export const updateAdditionalService = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remark } = req.body;

        // Validate required fields
        if (!id) {
            return res.status(400).json({ message: "Service ID is required" });
        }

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        // Find existing service
        const service = await AdditionalService.findById(id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // ✅ If status is 'completed', file upload is mandatory
        if (status.toLowerCase() === "completed") {
            if (!req.file) {
                return res.status(400).json({
                    message: "File upload is required when status is 'completed'",
                });
            }
            const { url } = await uploadToS3(req.file);
            service.report = url; // store uploaded file URL
        }

        // ✅ Update fields
        service.status = status;
        service.remark = remark || service.remark;

        // ✅ Track who updated the record
        const tokenUser = req.admin || req.user;
        const updaterId = tokenUser?._id || tokenUser?.id;
        const updaterModel = tokenUser?.role === "admin" ? "Admin" : "User";

        if (updaterId) {
            service.updatedBy = updaterId;
            service.updatedByModel = updaterModel;
        }

        // ✅ Save updated record
        await service.save();

        // ✅ Populate updatedBy for cleaner response
        const populatedService = await AdditionalService.findById(service._id)
            .populate({
                path: "updatedBy",
                select: "name email phone role technicianType",
            });

        return res.status(200).json({
            message: "Additional Service updated successfully",
            service: populatedService,
        });
    } catch (error) {
        console.error("❌ Error updating additional service:", error);
        return res.status(500).json({
            message: "Server error while updating additional service",
            error: error.message,
        });
    }
};

export const assignAdditionalServiceStaff = async (req, res) => {
    try {
        const { orderId, serviceId } = req.params;
        const { assignedStaff, remark } = req.body;

        if (!orderId || !serviceId) {
            return res.status(400).json({ message: "Order ID and Service ID are required" });
        }

        if (!assignedStaff) {
            return res.status(400).json({ message: "Assigned staff is required" });
        }

        const service = await AdditionalService.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        const oldStatus = service.status || "pending";
        const newStatus = "pending"; // Stay in pending state only

        // 🔥 Track who updated
        const tokenUser = req.admin || req.user;
        let updatedBy = null;

        if (tokenUser) {
            updatedBy = {
                _id: (tokenUser._id || tokenUser.id).toString(),
                name: tokenUser.name,
                role: tokenUser.role
            };
        }

        // 🧾 Status History logic
        if (!service.statusHistory) service.statusHistory = [];
        service.statusHistory.push({
            oldStatus,
            newStatus,
            updatedBy,
            updatedAt: new Date()
        });

        service.assignedStaff = assignedStaff;
        service.status = newStatus;
        service.remark = remark || service.remark;
        service.assignedAt = new Date();

        await service.save();

        res.status(200).json({
            message: "Additional Service assigned successfully",
            service,
            assignedAt: service.assignedAt,
            statusHistory: service.statusHistory
        });
    } catch (error) {
        console.error("Error assigning additional service:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAssignedStaffDetailsForAdditionalService = async (req, res) => {
    try {
        const { orderId, serviceId } = req.params;

        if (!orderId || !serviceId) {
            return res.status(400).json({ message: "Order ID and Additional Service ID are required" });
        }

        const service = await AdditionalService.findById(serviceId).populate({
            path: "assignedStaff",
            select: "name email phone technicianType role profilePicture",
        });

        if (!service) {
            return res.status(404).json({ message: "Additional Service not found" });
        }

        if (!service.assignedStaff) {
            return res.status(404).json({
                success: false,
                message: "No staff assigned to this additional service yet"
            });
        }

        // Prepare available reports
        const reports = {
            submittedReport: service.submittedReport || null,
            completedReport: service.completedReport || null,
            genericReport: service.report || null
        };

        res.status(200).json({
            success: true,
            data: {
                assignedStaff: service.assignedStaff || null,
                status: service.status || "pending",
                remark: service.remark || "",
                reports: reports,
                assignedAt: service.assignedAt || null,
                statusHistory: service.statusHistory || []
            }
        });
    } catch (error) {
        console.error("❌ Error fetching assigned staff details:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching staff details",
            error: error.message
        });
    }
};

export const updateAdditionalServiceStatus = async (req, res) => {
    try {
        const { orderId, serviceId } = req.params;
        const { staffId, status, remark, fileUrl } = req.body;

        if (!orderId || !serviceId) {
            return res.status(400).json({ message: "Order ID and Additional Service ID are required" });
        }

        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const service = await AdditionalService.findById(serviceId);
        if (!service) {
            return res.status(404).json({ message: "Additional Service not found" });
        }

        const oldStatus = service.status || "pending";
        const newStatus = status.toLowerCase();

        // 🔥 Track who updated (using statusId from body or token)
        const tokenUser = req.admin || req.user;
        let updatedBy = null;

        if (tokenUser) {
            updatedBy = {
                _id: (tokenUser._id || tokenUser.id).toString(),
                name: tokenUser.name,
                role: tokenUser.role
            };
        } else if (staffId) {
            // Fallback to staffId from body if no token (though middleware usually handles this)
            const staff = await Employee.findById(staffId);
            if (staff) {
                updatedBy = {
                    _id: staff._id.toString(),
                    name: staff.name,
                    role: "Employee"
                };
            }
        }

        // 🧾 Status History logic
        if (!service.statusHistory) service.statusHistory = [];
        service.statusHistory.push({
            oldStatus,
            newStatus,
            updatedBy,
            updatedAt: new Date()
        });

        // 📄 Handle Report URLs (priority to req.file)
        let finalFileUrl = fileUrl || null;
        if (req.file) {
            const uploaded = await uploadToS3(req.file);
            finalFileUrl = uploaded.url;
        }

        if (newStatus === "submitted" && finalFileUrl) {
            service.submittedReport = finalFileUrl;
        } else if (newStatus === "completed" && finalFileUrl) {
            service.completedReport = finalFileUrl;
        } else if (finalFileUrl) {
            // Generic report update if status unknown but file provided
            service.report = finalFileUrl;
        }

        service.status = newStatus;
        if (remark) service.remark = remark;
        if (staffId) service.assignedStaff = staffId; // Keep assigned staff updated if changed

        await service.save();

        res.status(200).json({
            success: true,
            message: `Status updated to '${newStatus}' successfully`,
            service,
            statusHistory: service.statusHistory
        });
    } catch (error) {
        console.error("❌ Error updating additional service status:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating status",
            error: error.message
        });
    }
};

const getUpdatedAdditionalServiceReport = asyncHandler(async (req, res) => {
    try {
        const { orderId, additionalServiceId } = req.params;

        if (!orderId || !additionalServiceId) {
            return res.status(400).json({ message: "Order ID and Additional Service ID are required" });
        }

        const order = await orderModel.findById(orderId).populate('additionalServices');
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const additionalService = order.additionalServices.find(
            (service) => service._id.toString() === additionalServiceId
        );
        if (!additionalService) {
            return res.status(404).json({ message: "Additional Service not found in this order" });
        }

        // ✅ Optionally fetch the latest version directly from DB for updated data
        const updatedService = await AdditionalService.findById(additionalServiceId);
        if (!updatedService) {
            return res.status(404).json({ message: "Additional Service not found" });
        }

        // ✅ Return the updated report details
        res.status(200).json({
            message: "Fetched updated additional service report successfully",
            data: {
                orderId: order._id,
                orderSrfNumber: order.srfNumber,
                additionalService: updatedService,
            },
        });

    } catch (error) {
        console.error("Error fetching updated additional service report:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// const assignToOfficeStff

// PATCH controller
// const editDocuments = asyncHandler(async (req, res) => {
//     try {
//         const { orderId, serviceId, technicianId, workType } = req.params;

//         // ✅ Upload files to S3
//         let uploadFileUrl = null;
//         let viewFileUrls = [];

//         if (req.files?.uploadFile?.[0]) {
//             const uploaded = await uploadToS3(req.files.uploadFile[0]);
//             uploadFileUrl = uploaded.url;
//         }

//         if (req.files?.viewFile?.length > 0) {
//             const uploads = await Promise.all(
//                 req.files.viewFile.map((file) => uploadToS3(file))
//             );
//             viewFileUrls = uploads.map((u) => u.url);
//         }

//         if (!uploadFileUrl && viewFileUrls.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No files uploaded",
//             });
//         }

//         // ✅ Ensure order exists
//         const order = await orderModel.findById(orderId).populate("services");
//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found",
//             });
//         }

//         // ✅ Ensure service exists
//         const service = await Services.findById(serviceId);
//         if (!service) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Service not found",
//             });
//         }

//         // ✅ Find workTypeDetails matching workType & technician
//         const workTypeDetail = service.workTypeDetails.find(
//             (wt) =>
//                 wt.workType === workType &&
//                 (wt.engineer?.toString() === technicianId ||
//                     wt.officeStaff?.toString() === technicianId)
//         );

//         if (!workTypeDetail) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Work type detail not found for this technician",
//             });
//         }

//         // ✅ Update fields
//         // if (uploadFileUrl) {
//         //     workTypeDetail.uploadFile = uploadFileUrl;
//         // }
//         // if (viewFileUrls.length > 0) {
//         //     workTypeDetail.viewFile = [
//         //         ...(workTypeDetail.viewFile || []),
//         //         ...viewFileUrls,
//         //     ];
//         // }

//         // ✅ Update fields
//         if (uploadFileUrl) {
//             workTypeDetail.uploadFile = uploadFileUrl; // replace existing uploadFile
//         }
//         if (viewFileUrls.length > 0) {
//             workTypeDetail.viewFile = viewFileUrls; // overwrite existing viewFile
//         }

//         await service.save();

//         res.status(200).json({
//             success: true,
//             message: "Documents updated successfully",
//             data: workTypeDetail,
//         });
//     } catch (error) {
//         console.error("Error in editDocuments:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error while updating documents",
//             error: error.message,
//         });
//     }
// });

const editDocuments = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, technicianId, workType } = req.params;
        const { action = 'add', targetIndex } = req.body; // Default to 'add' for viewFile

        // Validate action
        const validActions = ['add', 'replace_all', 'replace', 'delete'];
        if (!validActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be one of: add, replace_all, replace, delete",
            });
        }

        // Validate targetIndex if required
        if ((action === 'replace' || action === 'delete') && (!targetIndex || isNaN(parseInt(targetIndex)))) {
            return res.status(400).json({
                success: false,
                message: "targetIndex is required and must be a valid number for replace/delete actions",
            });
        }

        // ✅ Upload files to S3
        let uploadFileUrl = null;
        let viewFileUrls = [];

        if (req.files?.uploadFile?.[0]) {
            const uploaded = await uploadToS3(req.files.uploadFile[0]);
            uploadFileUrl = uploaded.url;
        }

        if (req.files?.viewFile?.length > 0) {
            const uploads = await Promise.all(
                req.files.viewFile.map((file) => uploadToS3(file))
            );
            viewFileUrls = uploads.map((u) => u.url);
        }

        if (!uploadFileUrl && viewFileUrls.length === 0 && action !== 'delete') {
            return res.status(400).json({
                success: false,
                message: "No files uploaded for add/replace actions",
            });
        }

        // ✅ Ensure order exists
        const order = await orderModel.findById(orderId).populate("services");
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // ✅ Ensure service exists
        const service = await Services.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // ✅ Find workTypeDetails matching workType & technician
        const workTypeDetail = service.workTypeDetails.find(
            (wt) =>
                wt.workType === workType &&
                (wt.engineer?.toString() === technicianId ||
                    wt.officeStaff?.toString() === technicianId)
        );

        if (!workTypeDetail) {
            return res.status(404).json({
                success: false,
                message: "Work type detail not found for this technician",
            });
        }

        // ✅ Update uploadFile (always replace if provided)
        if (uploadFileUrl) {
            workTypeDetail.uploadFile = uploadFileUrl;
        }

        // ✅ Update viewFile based on action
        if (viewFileUrls.length > 0 || action === 'delete') {
            let currentViewFiles = workTypeDetail.viewFile || [];
            const index = parseInt(targetIndex);

            switch (action) {
                case 'add':
                    // Append new files to existing array
                    workTypeDetail.viewFile = [...currentViewFiles, ...viewFileUrls];
                    break;

                case 'replace_all':
                    // Overwrite entire array with new files
                    workTypeDetail.viewFile = viewFileUrls;
                    break;

                case 'replace':
                    // Replace specific file at index (if index exists and new files provided)
                    if (index >= 0 && index < currentViewFiles.length && viewFileUrls.length > 0) {
                        currentViewFiles[index] = viewFileUrls[0]; // Assume single file for replace; extend if needed
                        workTypeDetail.viewFile = currentViewFiles;
                    } else {
                        return res.status(400).json({
                            success: false,
                            message: "Invalid index or no new file provided for replace",
                        });
                    }
                    break;

                case 'delete':
                    // Remove file at specific index (no new files needed)
                    if (index >= 0 && index < currentViewFiles.length) {
                        currentViewFiles.splice(index, 1);
                        workTypeDetail.viewFile = currentViewFiles;
                    } else {
                        return res.status(400).json({
                            success: false,
                            message: "Invalid index for delete",
                        });
                    }
                    break;

                default:
                    // Should not reach here due to earlier validation
                    break;
            }
        }

        await service.save();

        res.status(200).json({
            success: true,
            message: "Documents updated successfully",
            data: workTypeDetail,
        });
    } catch (error) {
        console.error("Error in editDocuments:", error);
        res.status(500).json({
            success: false,
            message: "Server error while updating documents",
            error: error.message,
        });
    }
});
const deleteDocument = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, technicianId, workType } = req.params;
        const { fileUrl, fileType } = req.body;
        // fileType can be "uploadFile" or "viewFile"

        if (!fileUrl || !fileType) {
            return res.status(400).json({
                success: false,
                message: "fileUrl and fileType are required",
            });
        }

        // ✅ Ensure order exists
        const order = await orderModel.findById(orderId).populate("services");
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        // ✅ Ensure service exists
        const service = await Services.findById(serviceId);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // ✅ Find workTypeDetails matching workType & technician
        const workTypeDetail = service.workTypeDetails.find(
            (wt) =>
                wt.workType === workType &&
                (wt.engineer?.toString() === technicianId ||
                    wt.officeStaff?.toString() === technicianId)
        );

        if (!workTypeDetail) {
            return res.status(404).json({
                success: false,
                message: "Work type detail not found for this technician",
            });
        }

        // ✅ Delete file from workTypeDetail
        if (fileType === "uploadFile" && workTypeDetail.uploadFile === fileUrl) {
            workTypeDetail.uploadFile = null;
        } else if (fileType === "viewFile" && workTypeDetail.viewFile?.length) {
            workTypeDetail.viewFile = workTypeDetail.viewFile.filter(
                (url) => url !== fileUrl
            );
        } else {
            return res.status(404).json({
                success: false,
                message: "File not found in the specified field",
            });
        }

        // ✅ (Optional) Delete from S3 too
        // await deleteFromS3(fileUrl);

        await service.save();

        res.status(200).json({
            success: true,
            message: "Document deleted successfully",
            data: workTypeDetail,
        });
    } catch (error) {
        console.error("Error in deleteDocument:", error);
        res.status(500).json({
            success: false,
            message: "Server error while deleting document",
            error: error.message,
        });
    }
});


const assignStaffByElora = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, officeStaffId, workType, status } = req.params;
        console.log("hi from assignStaffByElora ");
        console.log("🚀 officeStaffId:", officeStaffId);
        console.log("🚀 serviceId:", serviceId);
        console.log("🚀 orderId:", orderId);
        console.log("🚀 workType:", workType);
        console.log("🚀 status:", status);

        // 1️⃣ Validate order
        const order = await orderModel.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        if (!order.services.includes(serviceId)) {
            return res.status(400).json({ message: "Service not linked to this order" });
        }

        // 2️⃣ Validate service
        const service = await Services.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        // 3️⃣ Validate office staff
        const staff = await Employee.findById(officeStaffId);
        if (!staff || staff.technicianType !== "office-staff") {
            return res
                .status(400)
                .json({ message: "Invalid staff or not an office staff type" });
        }

        // 4️⃣ Find the workTypeDetail by workType param
        const workDetail = service.workTypeDetails.find(
            (w) => w.workType && w.workType.toLowerCase() === workType.toLowerCase()
        );

        if (!workDetail) {
            return res
                .status(404)
                .json({ message: `WorkType '${workType}' not found in this service` });
        }

        // 5️⃣ Create or update Elora subdocument
        if (!workDetail.elora) {
            // create a new Elora document
            const newElora = await Elora.create({ officeStaff: officeStaffId });
            workDetail.elora = newElora._id;
        } else {
            await Elora.findByIdAndUpdate(workDetail.elora, {
                officeStaff: officeStaffId,
            });
        }

        // 6️⃣ Update status if provided
        if (status) workDetail.status = status;

        // 7️⃣ Save service
        await service.save();

        res.status(200).json({
            message: `Office staff assigned successfully to Elora for workType '${workType}'`,
            service,
        });
    } catch (error) {
        console.error("❌ Error assigning office staff to Elora:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
});


const getAllOrdersByHospitalId = asyncHandler(async (req, res) => {
    try {
        const { hospitalId } = req.params;
        console.log("🚀 ~ hospitalId:", hospitalId)

        if (!hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID is required",
            });
        }

        // Validate hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        // ✅ Use hospital ObjectId instead of hospitalName
        const orders = await orderModel.find({ hospital: hospitalId })
            .sort({ createdAt: -1 })
            .populate("services", "machineType equipmentNo machineModel serialNumber remark workTypeDetails")
            .populate("additionalServices", "name description totalAmount")
            .populate("customer", "name email role")
            .populate("quotation", "quotationNumber status")
            .populate("payment")
            .populate("courierDetails");


        if (!orders || orders.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No orders found for this hospital",
                orders: [],
            });
        }

        res.status(200).json({
            success: true,
            hospital: {
                id: hospital._id,
                name: hospital.name,
                branch: hospital.branch,
                phone: hospital.phone,
                email: hospital.email,
            },
            totalOrders: orders.length,
            orders,
        });
    } catch (error) {
        console.error("Error fetching orders by hospitalId:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching orders",
            error: error.message,
        });
    }
});

// const getOrderByHospitalIdOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, orderId } = req.params;
//         console.log("🚀 ~ orderId:", orderId);
//         console.log("🚀 ~ hospitalId:", hospitalId);

//         if (!hospitalId || !orderId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Hospital ID and Order ID are required",
//             });
//         }

//         // 1️⃣ Validate hospital exists
//         const hospital = await Hospital.findById(hospitalId);
//         if (!hospital) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Hospital not found",
//             });
//         }

//         // Find order by _id AND hospital (ObjectId reference)
//         const order = await orderModel.findOne({
//             _id: orderId,
//             hospital: hospitalId,
//         })
//             .populate("services", "machineType equipmentNo machineModel serialNumber remark workTypeDetails")
//             .populate("additionalServices", "name description totalAmount")
//             .populate("customer", "name email role")
//             .populate("quotation", "quotationNumber status")
//             .populate("payment")
//             .populate("courierDetails")
//             .populate("hospital", "name branch phone email"); // 👉 optional: populate hospital

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found for this hospital",
//             });
//         }
//         res.status(200).json({
//             success: true,
//             order,
//         });
//     } catch (error) {
//         console.error("Error fetching order by hospitalId + orderId:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error fetching order",
//             error: error.message,
//         });
//     }
// });



// const getOrderByHospitalIdOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, orderId } = req.params;

//         if (!hospitalId || !orderId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Hospital ID and Order ID are required",
//             });
//         }

//         // 1️⃣ Validate hospital exists
//         const hospital = await Hospital.findById(hospitalId);
//         if (!hospital) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Hospital not found",
//             });
//         }

//         // 2️⃣ Find order by _id AND hospital
//         const order = await orderModel.findOne({
//             _id: orderId,
//             hospital: hospitalId,
//         })
//             .populate({
//                 path: "services",
//                 populate: {
//                     path: "workTypeDetails.QAtest",
//                     select: "reportUrl reportStatus", // select the URL and status
//                 },
//             })
//             .populate("additionalServices", "name description totalAmount")
//             .populate("customer", "name email role")
//             .populate("quotation", "quotationNumber status")
//             .populate("payment")
//             .populate("courierDetails")
//             .populate("hospital", "name branch phone email");

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found for this hospital",
//             });
//         }

//         // 3️⃣ Map services to include QA report URL or null
//         const servicesWithReports = order.services.map(service => {
//             const workDetails = service.workTypeDetails.map(wt => {
//                 let qaReportUrl = null;

//                 // Check if QAtest exists
//                 if (wt.QAtest) {
//                     // Use reportULRNumber first, fallback to report field
//                     qaReportUrl = wt.QAtest.reportULRNumber || wt.QAtest.report || null;
//                 }

//                 return {
//                     ...wt.toObject(),
//                     qaReportUrl,
//                     qaReportStatus: wt.QAtest ? wt.QAtest.reportStatus || null : null,
//                 };
//             });

//             return {
//                 ...service.toObject(),
//                 workTypeDetails: workDetails,
//             };
//         });

//         const orderResponse = {
//             ...order.toObject(),
//             services: servicesWithReports,
//         };

//         res.status(200).json({
//             success: true,
//             order: orderResponse,
//         });
//     } catch (error) {
//         console.error("Error fetching order by hospitalId + orderId:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error fetching order",
//             error: error.message,
//         });
//     }
// });




// const getOrderByHospitalIdOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, orderId } = req.params;

//         if (!hospitalId || !orderId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Hospital ID and Order ID are required",
//             });
//         }

//         // Validate hospital exists
//         const hospital = await Hospital.findById(hospitalId);
//         if (!hospital) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Hospital not found",
//             });
//         }

//         // Find order by _id AND hospital
//         const order = await orderModel.findOne({
//             _id: orderId,
//             hospital: hospitalId,
//         })
//             .populate({
//                 path: "services",
//                 populate: {
//                     path: "workTypeDetails.QAtest",
//                     select: "reportULRNumber report qaTestReportNumber reportStatus", // select the correct fields
//                 },
//             })
//             .populate("additionalServices", "name description totalAmount report")
//             .populate("customer", "name email role")
//             .populate("quotation", "quotationNumber status")
//             .populate("payment")
//             .populate("courierDetails")
//             .populate("hospital", "name branch phone email");

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found for this hospital",
//             });
//         }

//         // Map services to inject qaReportUrl inside QAtest
//         const servicesWithReports = order.services.map(service => {
//             const workDetails = service.workTypeDetails.map(wt => {
//                 if (wt.QAtest) {
//                     // Inject qaReportUrl inside QAtest
//                     wt.QAtest = {
//                         ...wt.QAtest.toObject(),
//                         qaReportUrl: wt.QAtest.reportULRNumber || wt.QAtest.report || null,
//                     };
//                 }
//                 return wt;
//             });

//             return {
//                 ...service.toObject(),
//                 workTypeDetails: workDetails,
//             };
//         });

//         const orderResponse = {
//             ...order.toObject(),
//             services: servicesWithReports,
//         };

//         res.status(200).json({
//             success: true,
//             order: orderResponse,
//         });
//     } catch (error) {
//         console.error("Error fetching order by hospitalId + orderId:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error fetching order",
//             error: error.message,
//         });
//     }
// });


// const getOrderByHospitalIdOrderId = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, orderId } = req.params;

//         if (!hospitalId || !orderId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Hospital ID and Order ID are required",
//             });
//         }

//         // ✅ Validate hospital exists
//         const hospital = await Hospital.findById(hospitalId);
//         if (!hospital) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Hospital not found",
//             });
//         }

//         // ✅ Find order by _id AND hospital
//         const order = await orderModel
//             .findOne({
//                 _id: orderId,
//                 hospital: hospitalId,
//             })
//             .populate({
//                 path: "services",
//                 populate: {
//                     path: "workTypeDetails.QAtest",
//                     select: "reportULRNumber report qaTestReportNumber reportStatus",
//                 },
//             })
//             .populate("additionalServices", "name description totalAmount report")
//             .populate("customer", "name email role")
//             .populate("quotation", "quotationNumber status")
//             .populate("payment")
//             .populate("courierDetails")
//             .populate("hospital", "name branch phone email");

//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found for this hospital",
//             });
//         }

//         // ✅ Map services to inject qaReportUrl
//         const servicesWithReports = order.services.map(service => {
//             const workDetails = service.workTypeDetails.map(wt => {
//                 if (wt.QAtest) {
//                     wt.QAtest = {
//                         ...wt.QAtest.toObject(),
//                         qaReportUrl: wt.QAtest.reportULRNumber || wt.QAtest.report || null,
//                     };
//                 }
//                 return wt;
//             });

//             return {
//                 ...service.toObject(),
//                 workTypeDetails: workDetails,
//             };
//         });

//         // ✅ Fetch invoice details related to this order
//         const invoice = await Invoice.findOne({ order: orderId }).select("invoiceuploaded invoicePdf");

//         const orderResponse = {
//             ...order.toObject(),
//             services: servicesWithReports,
//             invoiceuploaded: invoice ? invoice.invoiceuploaded : false,
//             invoicePdf: invoice ? invoice.invoicePdf : null,
//         };

//         res.status(200).json({
//             success: true,
//             order: orderResponse,
//         });
//     } catch (error) {
//         console.error("❌ Error fetching order by hospitalId + orderId:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server error fetching order",
//             error: error.message,
//         });
//     }
// });


const getOrderByHospitalIdOrderId = asyncHandler(async (req, res) => {
    try {
        const { hospitalId, orderId } = req.params;

        if (!hospitalId || !orderId) {
            return res.status(400).json({
                success: false,
                message: "Hospital ID and Order ID are required",
            });
        }

        // ✅ Validate hospital exists
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: "Hospital not found",
            });
        }

        // ✅ Find order with populated data
        const order = await orderModel
            .findOne({
                _id: orderId,
                hospital: hospitalId,
            })
            .populate({
                path: "services",
                populate: {
                    path: "workTypeDetails.QAtest",
                    select: "reportULRNumber report qaTestReportNumber reportStatus",
                },
            })
            .populate("additionalServices", "name description totalAmount report")
            .populate("customer", "name email role")
            .populate("quotation", "quotationNumber status")
            .populate("payment")
            .populate("courierDetails")
            .populate("hospital", "name branch phone email");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found for this hospital",
            });
        }

        // ✅ Map services: include QA report ONLY if reportStatus = 'accepted'
        const servicesWithReports = order.services.map(service => {
            const workDetails = service.workTypeDetails.map(wt => {
                if (wt.QAtest) {
                    const qa = wt.QAtest.toObject();
                    // Only include report if reportStatus is accepted
                    if (qa.reportStatus === "accepted") {
                        qa.qaReportUrl = qa.reportULRNumber || qa.report || null;
                    } else {
                        // Exclude/Nullify report info if not accepted
                        qa.qaReportUrl = null;
                        qa.report = null;
                        qa.reportULRNumber = null;
                    }
                    wt.QAtest = qa;
                }
                return wt;
            });

            return {
                ...service.toObject(),
                workTypeDetails: workDetails,
            };
        });

        // ✅ Fetch invoice related to this order
        const invoice = await Invoice.findOne({ order: orderId }).select("invoiceuploaded invoicePdf");

        const orderResponse = {
            ...order.toObject(),
            services: servicesWithReports,
            invoiceuploaded: invoice ? invoice.invoiceuploaded : false,
            invoicePdf: invoice ? invoice.invoicePdf : null,
        };

        res.status(200).json({
            success: true,
            order: orderResponse,
        });
    } catch (error) {
        console.error("❌ Error fetching order by hospitalId + orderId:", error);
        res.status(500).json({
            success: false,
            message: "Server error fetching order",
            error: error.message,
        });
    }
});



// const getQaReportsByTechnician = async (req, res) => {
//     try {
//         const { technicianId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(technicianId)) {
//             return res.status(400).json({ success: false, message: "Invalid technicianId" });
//         }

//         const services = await Services.find({
//             "workTypeDetails.engineer": technicianId,
//         }).populate({
//             path: "workTypeDetails.QAtest",
//             select: "report reportULRNumber qaTestReportNumber reportStatus createdAt",
//         });

//         if (!services || services.length === 0) {
//             return res.status(404).json({ success: false, message: "No QA reports found for this technician" });
//         }

//         const serviceIds = services.map(s => s._id);
//         const orders = await orderModel.find({ services: { $in: serviceIds } })
//             .select("_id srfNumber partyCodeOrSysId procNoOrPoNo services");

//         const reports = [];
//         for (const service of services) {
//             const parentOrder = orders.find(order => order.services.includes(service._id));
//             service.workTypeDetails.forEach(wt => {
//                 if (
//                     wt.engineer?.toString() === technicianId &&
//                     wt.QAtest &&
//                     wt.QAtest.reportStatus === "pending" // ✅ filter pending only
//                 ) {
//                     reports.push({
//                         orderId: parentOrder?._id,
//                         srfNumber: parentOrder?.srfNumber,
//                         procNoOrPoNo: parentOrder?.procNoOrPoNo,
//                         partyCodeOrSysId: parentOrder?.partyCodeOrSysId,
//                         serviceId: service._id,
//                         machineType: service.machineType,
//                         qaReportId: wt.QAtest._id,
//                         report: wt.QAtest.report,
//                         reportULRNumber: wt.QAtest.reportULRNumber,
//                         qaTestReportNumber: wt.QAtest.qaTestReportNumber,
//                         uploadedAt: wt.QAtest.createdAt,
//                         reportStatus: wt.QAtest.reportStatus
//                     });
//                 }
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             technicianId,
//             totalReports: reports.length,
//             reports,
//         });
//     } catch (error) {
//         console.error("❌ Error in getQaReportsByTechnician:", error);
//         res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };


const getQaReportsByTechnician = async (req, res) => {
    try {
        const { technicianId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(technicianId)) {
            return res.status(400).json({ success: false, message: "Invalid technicianId" });
        }

        // 1️⃣ Find all services that include this technician in workTypeDetails
        const services = await Services.find({
            "workTypeDetails.engineer": technicianId,
        }).populate({
            path: "workTypeDetails.QAtest",
            select: "report reportULRNumber qaTestReportNumber reportStatus createdAt",
        });

        if (!services || services.length === 0) {
            return res.status(200).json({
                success: true,
                technicianId,
                totalReports: 0,
                reports: [],
            });
        }

        // 2️⃣ Fetch related orders for those services
        const serviceIds = services.map(s => s._id);
        const orders = await orderModel.find({ services: { $in: serviceIds } })
            .select("_id srfNumber partyCodeOrSysId procNoOrPoNo services");

        const reports = [];

        // 3️⃣ Collect reports with status 'pending' OR 'reuploaded'
        for (const service of services) {
            const parentOrder = orders.find(order => order.services.includes(service._id));
            service.workTypeDetails.forEach(wt => {
                if (
                    wt.engineer?.toString() === technicianId &&
                    wt.QAtest &&
                    ["pending", "reuploaded"].includes(wt.QAtest.reportStatus)
                ) {
                    reports.push({
                        orderId: parentOrder?._id,
                        srfNumber: parentOrder?.srfNumber,
                        procNoOrPoNo: parentOrder?.procNoOrPoNo,
                        partyCodeOrSysId: parentOrder?.partyCodeOrSysId,
                        serviceId: service._id,
                        machineType: service.machineType,
                        qaReportId: wt.QAtest._id,
                        report: wt.QAtest.report,
                        reportULRNumber: wt.QAtest.reportULRNumber,
                        qaTestReportNumber: wt.QAtest.qaTestReportNumber,
                        uploadedAt: wt.QAtest.createdAt,
                        reportStatus: wt.QAtest.reportStatus
                    });
                }
            });
        }

        // ✅ 4️⃣ Sort reports by latest uploadedAt first
        reports.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        // 5️⃣ Send response
        return res.status(200).json({
            success: true,
            technicianId,
            totalReports: reports.length,
            reports,
        });
    } catch (error) {
        console.error("❌ Error in getQaReportsByTechnician:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


// const getQaReportsByTechnician = async (req, res) => {
//     try {
//         const { technicianId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(technicianId)) {
//             return res.status(400).json({ success: false, message: "Invalid technicianId" });
//         }

//         const services = await Services.find({
//             "workTypeDetails.engineer": technicianId,
//         });

//         if (!services.length) {
//             return res.status(404).json({ success: false, message: "No QA reports found" });
//         }

//         // 1️⃣ Collect all QAtest IDs
//         const qaTestIds = [];
//         services.forEach(service => {
//             service.workTypeDetails.forEach(wt => {
//                 if (wt.engineer?.toString() === technicianId && wt.QAtest) {
//                     qaTestIds.push(wt.QAtest);
//                 }
//             });
//         });

//         // 2️⃣ Fetch all QATest documents at once
//         const qaTests = await QATest.find({ _id: { $in: qaTestIds } });

//         // 3️⃣ Collect reports
//         const reports = [];

//         services.forEach(service => {
//             service.workTypeDetails.forEach(wt => {
//                 if (wt.engineer?.toString() === technicianId && wt.QAtest) {
//                     const qaTest = qaTests.find(q => q._id.equals(wt.QAtest));
//                     if (qaTest && ["pending", "reuploaded"].includes(qaTest.reportStatus)) {
//                         reports.push({
//                             serviceId: service._id,
//                             machineType: service.machineType,
//                             qaReportId: qaTest._id,
//                             report: qaTest.report,
//                             reportULRNumber: qaTest.reportULRNumber,
//                             qaTestReportNumber: qaTest.qaTestReportNumber,
//                             uploadedAt: qaTest.createdAt,
//                             reportStatus: qaTest.reportStatus
//                         });
//                     }
//                 }
//             });
//         });

//         return res.status(200).json({
//             success: true,
//             technicianId,
//             totalReports: reports.length,
//             reports
//         });
//     } catch (error) {
//         console.error("❌ Error in getQaReportsByTechnician:", error);
//         res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };




// GET /admin/orders/:orderId/:serviceId/:qaReportId


// GET QA Report by orderId, serviceId, qaReportId
// const getReportById = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, qaReportId } = req.params;

//     // Validate IDs
//     if (!mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(qaReportId)) {
//         return res.status(400).json({ success: false, message: "Invalid ID(s)" });
//     }

//     // Populate services -> workTypeDetails -> QAtest -> officeStaff
//     const order = await orderModel.findById(orderId)
//         .populate({
//             path: "services",
//             populate: {
//                 path: "workTypeDetails.QAtest",
//                 populate: { path: "officeStaff ", select: "name email" }
//             }
//         });

//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     // Find service
//     const service = order.services.find(s => s._id.toString() === serviceId);
//     if (!service) return res.status(404).json({ success: false, message: "Service not found in this order" });

//     // Find QA report
//     let foundReport = null;
//     service.workTypeDetails.forEach(wt => {
//         const qaId = wt.QAtest?._id ? wt.QAtest._id.toString() : wt.QAtest?.toString();
//         if (qaId === qaReportId) {
//             foundReport = {
//                 orderId: order._id,
//                 serviceId: service._id,
//                 // srfNumber: order.srfNumber,
//                 // procNoOrPoNo: order.procNoOrPoNo,
//                 // partyCodeOrSysId: order.partyCodeOrSysId,
//                 // machineType: service.machineType,
//                 reportId: qaId,
//                 report: wt.QAtest?.report,
//                 // reportULRNumber: wt.QAtest?.reportULRNumber,
//                 // qaTestReportNumber: wt.QAtest?.qaTestReportNumber,
//                 // uploadedAt: wt.QAtest?.createdAt,
//                 officeStaff: wt.QAtest?.officeStaff,
//             };
//         }
//     });

//     if (!foundReport) return res.status(404).json({ success: false, message: "Report not found in this service" });

//     res.status(200).json({ success: true, report: foundReport });
// });


// const getQaReportsByTechnician = async (req, res) => {
//     try {
//         const { technicianId } = req.params;

//         if (!mongoose.Types.ObjectId.isValid(technicianId)) {
//             return res.status(400).json({ success: false, message: "Invalid technicianId" });
//         }

//         // Step 1: Fetch all services assigned to this technician
//         const services = await Services.find({
//             "workTypeDetails.engineer": technicianId
//         }).populate({
//             path: "workTypeDetails.QAtest",
//             select: "report reportULRNumber qaTestReportNumber reportStatus createdAt"
//         });

//         if (!services.length) {
//             return res.status(404).json({ success: false, message: "No services found for this technician" });
//         }

//         // Step 2: Fetch orders containing these services
//         const serviceIds = services.map(s => s._id);
//         const orders = await orderModel.find({
//             services: { $elemMatch: { $in: serviceIds } }
//         }).select("_id srfNumber partyCodeOrSysId procNoOrPoNo services");

//         // Step 3: Build pending QA reports
//         const reports = [];

//         for (const service of services) {
//             // Find parent order by comparing ObjectIds
//             const parentOrder = orders.find(order =>
//                 order.services.some(sId => sId.equals(service._id))
//             );

//             service.workTypeDetails.forEach(wt => {
//                 if (wt.engineer?.toString() === technicianId && wt.QAtest?.reportStatus === "pending") {
//                     reports.push({
//                         orderId: parentOrder?._id,
//                         srfNumber: parentOrder?.srfNumber,
//                         procNoOrPoNo: parentOrder?.procNoOrPoNo,
//                         partyCodeOrSysId: parentOrder?.partyCodeOrSysId,
//                         serviceId: service._id,
//                         machineType: service.machineType,
//                         qaReportId: wt.QAtest._id,
//                         report: wt.QAtest.report,
//                         reportULRNumber: wt.QAtest.reportULRNumber,
//                         qaTestReportNumber: wt.QAtest.qaTestReportNumber,
//                         uploadedAt: wt.QAtest.createdAt,
//                         reportStatus: wt.QAtest.reportStatus
//                     });
//                 }
//             });
//         }

//         if (!reports.length) {
//             return res.status(404).json({ success: false, message: "No pending QA reports found" });
//         }

//         return res.status(200).json({
//             success: true,
//             technicianId,
//             totalReports: reports.length,
//             reports
//         });

//     } catch (error) {
//         console.error("❌ Error in getQaReportsByTechnician:", error);
//         return res.status(500).json({ success: false, message: "Server error", error: error.message });
//     }
// };




const getReportById = asyncHandler(async (req, res) => {
    const { orderId, serviceId, qaReportId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(serviceId) ||
        !mongoose.Types.ObjectId.isValid(qaReportId)) {
        return res.status(400).json({ success: false, message: "Invalid ID(s)" });
    }

    // Populate services -> workTypeDetails -> QAtest -> officeStaff
    const order = await orderModel.findById(orderId)
        .populate({
            path: "services",
            populate: {
                path: "workTypeDetails.QAtest",
                populate: { path: "officeStaff", select: "name email" }
            }
        });

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Find service
    const service = order.services.find(s => s._id.toString() === serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found in this order" });

    // Find QA report
    let foundReport = null;
    service.workTypeDetails.forEach(wt => {
        const qaId = wt.QAtest?._id ? wt.QAtest._id.toString() : wt.QAtest?.toString();
        if (qaId === qaReportId) {
            foundReport = {
                orderId: order._id,
                serviceId: service._id,
                reportId: qaId,
                report: wt.QAtest?.report,
                reportStatus: wt.QAtest?.reportStatus,
                officeStaff: wt.QAtest?.officeStaff,
            };
        }
    });

    if (!foundReport) return res.status(404).json({ success: false, message: "Report not found in this service" });

    res.status(200).json({ success: true, report: foundReport });
});

// const acceptQAReport = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, qaReportId } = req.params;

//     // Validate ObjectIds
//     if (!mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(qaReportId)) {
//         return res.status(400).json({ success: false, message: "Invalid ID(s)" });
//     }

//     const order = await orderModel.findById(orderId).populate({
//         path: "services",
//         populate: {
//             path: "workTypeDetails.QAtest",
//         },
//     });

//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     const service = order.services.find(s => s._id.toString() === serviceId);
//     if (!service) return res.status(404).json({ success: false, message: "Service not found" });

//     const wt = service.workTypeDetails.find(w => w.QAtest && w.QAtest._id.toString() === qaReportId);
//     if (!wt) return res.status(404).json({ success: false, message: "QA Report not found" });

//     wt.QAtest.reportStatus = "accepted";
//     await wt.QAtest.save();

//     res.status(200).json({ success: true, message: "QA Report accepted", report: wt.QAtest });
// });



const acceptQAReport = asyncHandler(async (req, res) => {
    const { orderId, serviceId, qaReportId } = req.params;

    // Validate ObjectIds
    if (
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(serviceId) ||
        !mongoose.Types.ObjectId.isValid(qaReportId)
    ) {
        return res.status(400).json({ success: false, message: "Invalid ID(s)" });
    }

    // Find order with services and QA report populated
    const order = await orderModel.findById(orderId)
        .populate({
            path: "services",
            populate: { path: "workTypeDetails.QAtest" },
        })
        .populate("hospital"); // ✅ populate hospital directly

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const service = order.services.find(s => s._id.toString() === serviceId);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    const wt = service.workTypeDetails.find(
        w => w.QAtest && w.QAtest._id.toString() === qaReportId
    );
    if (!wt) return res.status(404).json({ success: false, message: "QA Report not found" });

    // ✅ Update QA Report status
    wt.QAtest.reportStatus = "accepted";
    await wt.QAtest.save();

    // ✅ Store this report in the hospital
    if (order.hospital) {
        await Hospital.findByIdAndUpdate(order.hospital._id, {
            $addToSet: { qaReports: wt.QAtest._id }, // prevent duplicates
        });
    }

    res.status(200).json({
        success: true,
        message: "QA Report accepted and stored in hospital",
        report: wt.QAtest,
    });
});


// const rejectQAReport = asyncHandler(async (req, res) => {
//     const { orderId, serviceId, qaReportId } = req.params;

//     // Validate ObjectIds
//     if (!mongoose.Types.ObjectId.isValid(orderId) ||
//         !mongoose.Types.ObjectId.isValid(serviceId) ||
//         !mongoose.Types.ObjectId.isValid(qaReportId)) {
//         return res.status(400).json({ success: false, message: "Invalid ID(s)" });
//     }

//     const order = await orderModel.findById(orderId).populate({
//         path: "services",
//         populate: {
//             path: "workTypeDetails.QAtest",
//         },
//     });

//     if (!order) return res.status(404).json({ success: false, message: "Order not found" });

//     const service = order.services.find(s => s._id.toString() === serviceId);
//     if (!service) return res.status(404).json({ success: false, message: "Service not found" });

//     const wt = service.workTypeDetails.find(w => w.QAtest && w.QAtest._id.toString() === qaReportId);
//     if (!wt) return res.status(404).json({ success: false, message: "QA Report not found" });

//     // Check if already accepted
//     if (wt.QAtest.reportStatus === "accepted") {
//         return res.status(400).json({ success: false, message: "Cannot reject. QA Report is already accepted." });
//     }

//     // Update status to rejected
//     wt.QAtest.reportStatus = "rejected";
//     await wt.QAtest.save();

//     res.status(200).json({ success: true, message: "QA Report rejected", report: wt.QAtest });
// });


const rejectQAReport = asyncHandler(async (req, res) => {
    const { orderId, serviceId, qaReportId } = req.params;
    const remark = req.body?.remark; // ✅ Safe access

    // ✅ Validate ObjectIds
    if (
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(serviceId) ||
        !mongoose.Types.ObjectId.isValid(qaReportId)
    ) {
        return res.status(400).json({ success: false, message: "Invalid ID(s)" });
    }

    // ✅ Ensure remark is provided
    if (!remark || remark.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Remark is required to reject a QA report",
        });
    }

    const order = await orderModel.findById(orderId).populate({
        path: "services",
        populate: {
            path: "workTypeDetails.QAtest",
        },
    });

    if (!order)
        return res.status(404).json({ success: false, message: "Order not found" });

    const service = order.services.find(s => s._id.toString() === serviceId);
    if (!service)
        return res.status(404).json({ success: false, message: "Service not found" });

    const wt = service.workTypeDetails.find(
        w => w.QAtest && w.QAtest._id.toString() === qaReportId
    );
    if (!wt)
        return res.status(404).json({ success: false, message: "QA Report not found" });

    if (wt.QAtest.reportStatus === "accepted") {
        return res.status(400).json({
            success: false,
            message: "Cannot reject. QA Report is already accepted.",
        });
    }

    wt.QAtest.reportStatus = "rejected";
    wt.QAtest.remark = remark.trim();

    await wt.QAtest.save();

    res.status(200).json({
        success: true,
        message: "QA Report rejected successfully",
        report: wt.QAtest,
    });
});


const getEloraReport = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId, eloraId } = req.params;

        // Validate IDs
        if (!orderId || !serviceId || !eloraId) {
            throw new ApiError(400, "orderId, serviceId and eloraId are required");
        }

        // Find the Elora report
        const eloraReport = await Elora.findById(eloraId)
            .populate("officeStaff", "name empId role") // populate office staff info
            .lean();

        if (!eloraReport) {
            throw new ApiError(404, "Elora report not found");
        }

        // Optional: check if the report belongs to the given order & service
        const order = await orderModel.findById(orderId)
            .populate("services")
            .lean();

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        const serviceExists = order.services.some(
            (service) => service._id.toString() === serviceId
        );

        if (!serviceExists) {
            throw new ApiError(400, "Service does not belong to this order");
        }

        // Return the Elora report
        return res.status(200).json(
            new ApiResponse(200, eloraReport, "Elora report fetched successfully")
        );
    } catch (error) {
        console.error("Get Elora Report Error:", error);
        if (error instanceof ApiError) {
            return res.status(error.statusCode).json({
                statusCode: error.statusCode,
                message: error.message,
                errors: error.errors || [],
            });
        }
        return res.status(500).json({
            statusCode: 500,
            message: "Failed to fetch Elora report",
            errors: [error.message],
        });
    }
});

const getReportStatus = async (req, res) => {
    try {

    } catch (error) {

    }
}

// const getPdfForAcceptQuotation = asyncHandler(async (req, res) => {
//     try {
//         const { orderId } = req.params;

//         // 1️⃣ Validate orderId
//         if (!orderId) {
//             return res.status(400).json({ message: "Order ID is required" });
//         }

//         // 2️⃣ Find the order and populate its quotation
//         const order = await orderModel.findById(orderId).populate("quotation");

//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         if (!order.quotation) {
//             return res.status(404).json({ message: "No quotation linked with this order" });
//         }

//         // 3️⃣ Get customer PDF from the linked quotation
//         const quotation = order.quotation;

//         if (!quotation.customersPDF) {
//             return res.status(404).json({ message: "Customer PDF not found " });
//         }

//         // 4️⃣ Return PDF details
//         res.status(200).json({
//             message: "Customer PDF retrieved successfully",
//             quotationId: quotation._id,
//             quotationNumber: quotation.quotationId,
//             pdfUrl: quotation.customersPDF,
//         });
//     } catch (error) {
//         console.error("Error fetching customer PDF:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// });


const getPdfForAcceptQuotation = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        // 1️⃣ Validate orderId
        if (!orderId) {
            return res.status(400).json({ message: "Order ID is required" });
        }

        // 2️⃣ Find the order and populate its quotation
        const order = await orderModel.findById(orderId).populate("quotation");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const quotation = order.quotation;

        // 3️⃣ Return PDF details or empty string if not available
        const pdfUrl = quotation?.customersPDF || "";

        res.status(200).json({
            message: "Customer PDF retrieved successfully",
            quotationId: quotation?._id || null,
            quotationNumber: quotation?.quotationId || null,
            pdfUrl,
        });
    } catch (error) {
        console.error("Error fetching customer PDF:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// const getAssignedOrdersForStaff = asyncHandler(async (req, res) => {
//     try {
//         const staffId = req.user.id;

//         // Step 1: Populate all services -> workTypeDetails -> QATest
//         const orders = await orderModel.find({})
//             .populate({
//                 path: "services",
//                 populate: {
//                     path: "workTypeDetails.QAtest",
//                     populate: { path: "officeStaff", select: "name email _id" }
//                 }
//             })
//             .populate("customer hospital payment courierDetails quotation additionalServices");

//         // Step 2: Filter orders where the logged-in staff is assigned in QATest
//         const filteredOrders = orders
//             .map(order => {
//                 const filteredServices = order.services.map(service => {
//                     const filteredWorkTypeDetails = service.workTypeDetails.filter(
//                         wt => wt.QAtest && wt.QAtest.officeStaff && wt.QAtest.officeStaff._id.toString() === staffId
//                     );
//                     return { ...service.toObject(), workTypeDetails: filteredWorkTypeDetails };
//                 }).filter(s => s.workTypeDetails.length > 0); // keep only services with matching QATest

//                 return filteredServices.length > 0 ? { ...order.toObject(), services: filteredServices } : null;
//             })
//             .filter(o => o !== null);

//         res.status(200).json({ success: true, orders: filteredOrders });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ success: false, message: "Server Error", error: error.message });
//     }
// });



// const getAssignedOrdersForStaff = asyncHandler(async (req, res) => {
//     try {
//         const staffId = req.user.id;

//         // Step 1: Populate all required references including services → workTypeDetails → QATest
//         let orders = await orderModel.find({})
//             .populate({
//                 path: "services",
//                 populate: {
//                     path: "workTypeDetails.QAtest",
//                     populate: { path: "officeStaff", select: "name email _id" }
//                 }
//             })
//             .populate("customer hospital payment courierDetails quotation additionalServices");

//         // Step 2: Filter only those orders where the logged-in staff is assigned in QATest
//         orders = orders
//             .map(order => {
//                 const filteredServices = order.services.map(service => {
//                     const filteredWorkTypeDetails = service.workTypeDetails.filter(
//                         wt =>
//                             wt.QAtest &&
//                             wt.QAtest.officeStaff &&
//                             wt.QAtest.officeStaff._id.toString() === staffId
//                     );
//                     return { ...service.toObject(), workTypeDetails: filteredWorkTypeDetails };
//                 }).filter(s => s.workTypeDetails.length > 0);

//                 return filteredServices.length > 0 ? { ...order.toObject(), services: filteredServices } : null;
//             })
//             .filter(o => o !== null);

//         // Step 3: Enrich each order with leadOwnerName & leadOwnerType (same as getAllOrders)
//         orders = await Promise.all(
//             orders.map(async (order) => {
//                 let leadOwnerName = "N/A";
//                 let leadOwnerType = "N/A";

//                 // Try Lead Owner first
//                 if (order.leadOwner && mongoose.Types.ObjectId.isValid(order.leadOwner)) {
//                     const user = await User.findById(order.leadOwner).select("name role");
//                     if (user) {
//                         leadOwnerName = user.name;
//                         leadOwnerType = user.role;
//                     }
//                 }

//                 // Fallback to Customer
//                 if (
//                     (leadOwnerName === "N/A" || leadOwnerType === "N/A") &&
//                     order.customer &&
//                     mongoose.Types.ObjectId.isValid(order.customer)
//                 ) {
//                     const customer = await User.findById(order.customer).select("name role");
//                     if (customer) {
//                         leadOwnerName = customer.name;
//                         leadOwnerType = customer.role;
//                     }
//                 }

//                 return {
//                     ...order,
//                     leadOwner: leadOwnerName,
//                     leadOwnerType,
//                 };
//             })
//         );

//         // Step 4: Return response
//         if (!orders || orders.length === 0) {
//             return res.status(200).json({
//                 success: true,
//                 count: 0,
//                 orders: [],
//                 message: "No assigned orders found",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             count: orders.length,
//             message: "Assigned orders fetched successfully",
//             orders,
//         });
//     } catch (error) {
//         console.error("Error in getAssignedOrdersForStaff:", error);
//         res.status(500).json({
//             success: false,
//             message: "Server Error",
//             error: error.message,
//         });
//     }
// });


const getAssignedOrdersForStaff = asyncHandler(async (req, res) => {
    try {
        const staffId = req.user.id;

        // Step 1: Populate all references (QATest + Elora)
        let orders = await orderModel.find({})
            .sort({ createdAt: -1 })
            .populate({
                path: "services",
                populate: {
                    path: "workTypeDetails.QAtest workTypeDetails.elora",
                    populate: { path: "officeStaff", select: "name email _id" }
                }
            })
            .populate("customer hospital payment courierDetails quotation additionalServices");

        // Step 2: Filter only orders where logged-in staff is assigned to either QATest or Elora
        orders = orders
            .map(order => {
                const filteredServices = order.services.map(service => {
                    const filteredWorkTypeDetails = service.workTypeDetails.filter(wt => {
                        const qaMatch =
                            wt.QAtest &&
                            wt.QAtest.officeStaff &&
                            wt.QAtest.officeStaff._id.toString() === staffId;

                        const eloraMatch =
                            wt.elora &&
                            wt.elora.officeStaff &&
                            wt.elora.officeStaff._id.toString() === staffId;

                        return qaMatch || eloraMatch; // ✅ include both cases
                    });

                    return { ...service.toObject(), workTypeDetails: filteredWorkTypeDetails };
                }).filter(s => s.workTypeDetails.length > 0);

                return filteredServices.length > 0 ? { ...order.toObject(), services: filteredServices } : null;
            })
            .filter(o => o !== null);

        // Step 3: Enrich with leadOwnerName & leadOwnerType
        orders = await Promise.all(
            orders.map(async (order) => {
                let leadOwnerName = "N/A";
                let leadOwnerType = "N/A";

                // Try Lead Owner first
                if (order.leadOwner && mongoose.Types.ObjectId.isValid(order.leadOwner)) {
                    const user = await User.findById(order.leadOwner).select("name role");
                    if (user) {
                        leadOwnerName = user.name;
                        leadOwnerType = user.role;
                    }
                }

                // Fallback to Customer
                if (
                    (leadOwnerName === "N/A" || leadOwnerType === "N/A") &&
                    order.customer &&
                    mongoose.Types.ObjectId.isValid(order.customer)
                ) {
                    const customer = await User.findById(order.customer).select("name role");
                    if (customer) {
                        leadOwnerName = customer.name;
                        leadOwnerType = customer.role;
                    }
                }

                return {
                    ...order,
                    leadOwner: leadOwnerName,
                    leadOwnerType,
                };
            })
        );

        // Step 4: Return response
        if (!orders || orders.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                orders: [],
                message: "No assigned orders found for this staff",
            });
        }

        res.status(200).json({
            success: true,
            count: orders.length,
            message: "Assigned orders (QA Test + Elora) fetched successfully",
            orders,
        });

    } catch (error) {
        console.error("Error in getAssignedOrdersForStaff:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error: error.message,
        });
    }
});



const deleteOrderAndReports = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    // 1️⃣ Check if the order exists
    const order = await orderModel.findById(orderId).populate({
        path: 'services',
        populate: {
            path: 'workTypeDetails.QAtest workTypeDetails.elora',
            model: 'QATest'
        }
    });

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // 2️⃣ Collect all related QATest and Elora IDs
    const qaTestIds = [];
    const eloraIds = [];

    for (const service of order.services) {
        for (const workDetail of service.workTypeDetails) {
            if (workDetail.QAtest) qaTestIds.push(workDetail.QAtest);
            if (workDetail.elora) eloraIds.push(workDetail.elora);
        }
    }

    // 3️⃣ Delete all related reports
    if (qaTestIds.length > 0) {
        await QATest.deleteMany({ _id: { $in: qaTestIds } });
    }
    if (eloraIds.length > 0) {
        await Elora.deleteMany({ _id: { $in: eloraIds } });
    }

    // 4️⃣ Delete all services linked to this order
    if (order.services.length > 0) {
        await Services.deleteMany({ _id: { $in: order.services } });
    }

    // 5️⃣ Finally, delete the order itself
    await orderModel.findByIdAndDelete(orderId);

    return res.status(200).json({
        success: true,
        message: 'Order and all related reports deleted successfully',
    });
});

const updateServicePrice = asyncHandler(async (req, res) => {
    try {
        const { orderId, serviceId } = req.params;
        const { price } = req.body;

        if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
            return res.status(400).json({ message: "Invalid or missing service ID." });
        }

        const service = await Services.findByIdAndUpdate(
            serviceId,
            { price: price || 0 },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        return res.status(200).json(
            new ApiResponse(200, service, "Price updated successfully")
        );
    } catch (error) {
        console.error("❌ Error updating service price:", error);
        return res.status(500).json({ message: "Failed to update service price", error: error.message });
    }
});

const getWorkOrderCopy = asyncHandler(async (req, res) => {
    try {
        const { orderId } = req.params;

        // ✅ Validate orderId
        if (!orderId) {
            throw new ApiError(400, "Order ID is required");
        }

        // ✅ Find order by ID
        const order = await orderModel.findById(orderId).select("workOrderCopy");

        if (!order) {
            throw new ApiError(404, "Order not found");
        }

        // ✅ Check if file exists
        if (!order.workOrderCopy) {
            throw new ApiError(404, "No Work Order Copy found for this order");
        }

        // ✅ Return the file URL (or you could stream/download if required)
        return res
            .status(200)
            .json(new ApiResponse(200, { workOrderCopy: order.workOrderCopy }, "Work Order Copy fetched successfully"));
    } catch (error) {
        console.error("❌ Error fetching work order copy:", error);
        throw new ApiError(500, "Failed to fetch Work Order Copy", [error.message]);
    }
});

const customerFeedback = asyncHandler(async (req, res) => {
    const { orderId, hospitalId } = req.params;
    console.log("orderId", orderId);
    console.log("hospitalId", hospitalId);
    const { customerFeedback: feedbackFromBody, feedback } = req.body || {};

    const feedbackText = (feedbackFromBody ?? feedback ?? "").toString().trim();

    // ✅ Validate IDs
    if (
        !mongoose.Types.ObjectId.isValid(orderId) ||
        !mongoose.Types.ObjectId.isValid(hospitalId)
    ) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid orderId or hospitalId")
        );
    }

    // ✅ Validate feedback
    if (!feedbackText) {
        return res.status(400).json(
            new ApiResponse(400, null, "Customer feedback is required")
        );
    }

    // ✅ Find order
    const order = await orderModel
        .findOne({ _id: orderId, hospital: hospitalId })
        .populate({
            path: "services",
            populate: {
                path: "workTypeDetails.QAtest",
                select: "reportStatus",
            },
        });

    // ❌ Order not found
    if (!order) {
        return res.status(404).json(
            new ApiResponse(404, null, "Order not found for the given hospital")
        );
    }
    order.services.forEach((service, i) => {
        console.log("Service", i, service.workTypeDetails);
    });
    // ✅ Check accepted report
    const hasAcceptedReport = (order.services || []).some((service) =>
        (service.workTypeDetails || []).some(
            (wt) => wt?.QAtest?.reportStatus === "accepted"
        )
    );

    if (!hasAcceptedReport) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Feedback can be submitted only after reportStatus is accepted"
            )
        );
    }

    // ✅ Save feedback
    order.customerFeedback = feedbackText;
    await order.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orderId: order._id,
                hospitalId: order.hospital,
                customerFeedback: order.customerFeedback,
            },
            "Customer feedback saved successfully"
        )
    );
});

const getCustomerFeedbackByOrderId = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(400, "Invalid orderId");
    }

    const order = await orderModel.findById(orderId).select("_id customerFeedback");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                orderId: order._id,
                customerFeedback: order.customerFeedback || "",
            },
            "Customer feedback fetched successfully"
        )
    );
});

export default { getAllOrders, getBasicDetailsByOrderId, getAdditionalServicesByOrderId, getAllServicesByOrderId, getMachineDetailsByOrderId, updateOrderDetails, updateEmployeeStatus, getQARawByOrderId, getAllOrdersForTechnician, startOrder, getSRFDetails, assignTechnicianByQARaw, assignOfficeStaffByQATest, getQaDetails, getAllOfficeStaff, getAssignedTechnicianName, getAssignedOfficeStaffName, getUpdatedOrderServices, getUpdatedOrderServices2, createOrder, completedStatusAndReport, getMachineDetails, updateServiceWorkType, updateAdditionalService, getUpdatedAdditionalServiceReport, editDocuments, assignStaffByElora, getAllOrdersByHospitalId, getOrderByHospitalIdOrderId, getReportNumbers, getQaReportsByTechnician, getReportById, acceptQAReport, rejectQAReport, getEloraReport, getPdfForAcceptQuotation, getAssignedOrdersForStaff, deleteOrderAndReports, getWorkOrderCopy, updateBasicDetailsByOrderId, assignAdditionalServiceStaff, updateAdditionalServiceStatus, getAssignedStaffDetailsForAdditionalService, addMachineToOrder, deleteMachineByorderId, updateServicePrice, customerFeedback, getCustomerFeedbackByOrderId }