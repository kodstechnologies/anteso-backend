import orderModel from "../../models/order.model.js";
import Order from "../../models/order.model.js";
import Payment from "../../models/payment.model.js";
import User from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { generateReadableId } from "../../utils/GenerateReadableId.js";
import { uploadToS3 } from "../../utils/s3Upload.js";
import mongoose from "mongoose";

const addPayment = asyncHandler(async (req, res) => {
    try {
        const {
            orderId,
            totalAmount,
            paymentAmount,
            paymentType,
            utrNumber,
            paymentMode,  // ✅ Added paymentMode
            paymentStatus  // ✅ Added paymentStatus
        } = req.body;

        console.log("🚀 ~ orderId:", orderId);
        console.log("🚀 ~ paymentType:", paymentType);
        console.log("🚀 ~ paymentAmount:", paymentAmount);
        console.log("🚀 ~ totalAmount:", totalAmount);
        console.log("🚀 ~ utrNumber:", utrNumber);
        console.log("🚀 ~ paymentMode:", paymentMode);
        console.log("🚀 ~ paymentStatus:", paymentStatus);

        // Validation
        if (!orderId || !paymentType) {
            res.status(400);
            throw new Error("orderId and paymentType are required");
        }

        // Find order by _id
        const order = await Order.findById(orderId);
        if (!order) {
            res.status(404);
            throw new Error("Order not found for the provided orderId");
        }

        // Screenshot upload
        let screenshotUrl = "";
        if (req.file) {
            const { url } = await uploadToS3(req.file);
            screenshotUrl = url;
        }

        // Create payment
        const payment = await Payment.create({
            orderId: order._id,
            totalAmount: totalAmount || order.totalAmount,
            paymentAmount,
            paymentType,
            utrNumber,
            paymentMode,  // ✅ Added paymentMode
            paymentStatus, // ✅ Added paymentStatus
            screenshot: screenshotUrl,
        });

        console.log("🚀 ~ payment created:", payment);

        res.status(201).json({
            success: true,
            message: "Payment added successfully",
            payment,
        });
    } catch (error) {
        console.error("❌ addPayment error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});


// const allOrdersWithClientName = asyncHandler(async (req, res) => {
//     try {
//         // Fetch all orders
//         const orders = await Order.find({}, "srfNumber hospitalName").lean();

//         // Map orders to append hospitalName to srfNumber
//         const formattedOrders = orders.map(order => ({
//             srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
//             ...order
//         }));

//         res.status(200).json({
//             success: true,
//             orders: formattedOrders
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// });





// const allOrdersWithClientName = asyncHandler(async (req, res) => {
//     try {

//         // 1️⃣ Fetch all orders
//         let orders = await orderModel.find({})
//             .select("srfNumber hospitalName leadOwner")
//             .sort({ createdAt: -1 })
//             .lean();

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: "No orders found" });
//         }

//         // 2️⃣ Get unique non-empty leadOwner IDs
//         // const leadOwnerIds = [...new Set(orders.map(o => o.leadOwner).filter(Boolean))];

//         // // 3️⃣ Fetch users for these leadOwners
//         // const users = await User.find({ _id: { $in: leadOwnerIds } })
//         //     .select("_id name role email")
//         //     .lean();

//         // // Build lookup map
//         // const userMap = {};
//         // users.forEach(u => {
//         //     userMap[u._id.toString()] = u;
//         // });
//         // unique names
//         const leadOwnerNames = [...new Set(orders.map(o => o.leadOwner).filter(Boolean))];

//         // query by name instead of _id
//         const users = await User.find({ name: { $in: leadOwnerNames } })
//             .select("_id name role email")
//             .lean();

//         const userMap = {};
//         users.forEach(u => {
//             userMap[u.name] = u; // map by name
//         });

//         orders = orders.filter(order => {
//             if (!order.leadOwner) return true;
//             const owner = userMap[order.leadOwner];
//             return owner && owner.role !== "Dealer";
//         });


//         // 4️⃣ Filter orders
//         orders = orders.filter(order => {
//             if (!order.leadOwner) return true; // ✅ keep if no leadOwner
//             const owner = userMap[order.leadOwner?.toString()];
//             return owner && owner.role !== "Dealer"; // ✅ keep only if not Dealer
//         });

//         // 5️⃣ Append hospitalName and owner details
//         const formattedOrders = orders.map(order => {
//             const owner = order.leadOwner ? userMap[order.leadOwner?.toString()] : null;
//             return {
//                 ...order,
//                 srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
//                 leadOwnerDetails: owner, // can be null if no leadOwner
//             };
//         });

//         res.status(200).json({
//             success: true,
//             count: formattedOrders.length,
//             orders: formattedOrders,
//         });
//     } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//         });
//     }
// });


// const allOrdersWithClientName = asyncHandler(async (req, res) => {
//     try {
//         // 1️⃣ Fetch all orders
//         let orders = await orderModel.find({})
//             .select("srfNumber hospitalName leadOwner _id")
//             .sort({ createdAt: -1 })
//             .lean();

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: "No orders found" });
//         }

//         // 2️⃣ Get unique non-empty leadOwner names
//         const leadOwnerNames = [...new Set(orders.map(o => o.leadOwner).filter(Boolean))];

//         // 3️⃣ Fetch users by name
//         const users = await User.find({ name: { $in: leadOwnerNames } })
//             .select("_id name role email")
//             .lean();

//         const userMap = {};
//         users.forEach(u => {
//             userMap[u.name] = u;
//         });
//         orders.forEach(order => {
//             if (order.leadOwner && !userMap[order.leadOwner.trim()]) {
//                 console.log("Missing leadOwner in userMap:", order.leadOwner);
//             }
//         });

//         // 4️⃣ Filter out orders with leadOwner role = 'Dealer'
//         orders = orders.filter(order => {
//             if (!order.leadOwner) return true;
//             const owner = userMap[order.leadOwner];
//             return owner && owner.role !== "Dealer";
//         });

//         // 5️⃣ Get all order IDs that already have payments
//         const paidOrders = await Payment.find({})
//             .select("orderId")
//             .lean();

//         const paidOrderIds = paidOrders.map(p => p.orderId.toString());

//         // 6️⃣ Filter out orders that are already paid
//         orders = orders.filter(order => !paidOrderIds.includes(order._id.toString()));

//         // 7️⃣ Format orders with srfNumberWithHospital and leadOwnerDetails
//         const formattedOrders = orders.map(order => {
//             const owner = order.leadOwner ? userMap[order.leadOwner] : null;
//             return {
//                 ...order,
//                 srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
//                 leadOwnerDetails: owner, // can be null if no leadOwner
//             };
//         });

//         res.status(200).json({
//             success: true,
//             count: formattedOrders.length,
//             orders: formattedOrders,
//         });
//     } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//         });
//     }
// });


// const allOrdersWithClientName = asyncHandler(async (req, res) => {
//     try {
//         // 1️⃣ Fetch all orders
//         let orders = await orderModel.find({})
//             .select("srfNumber hospitalName leadOwner _id")
//             .sort({ createdAt: -1 })
//             .lean();

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: "No orders found" });
//         }

//         // 2️⃣ Get unique non-empty leadOwner IDs (as strings)
//         const leadOwnerIds = [...new Set(orders.map(o => o.leadOwner).filter(Boolean))];

//         // 3️⃣ Fetch users by _id
//         const users = await User.find({ _id: { $in: leadOwnerIds } })
//             .select("_id name role email")
//             .lean();

//         // 4️⃣ Create userMap by _id string
//         const userMap = {};
//         users.forEach(u => {
//             userMap[u._id.toString()] = u;
//         });

//         // 🔹 Debug missing leadOwner IDs
//         orders.forEach(order => {
//             if (order.leadOwner && !userMap[order.leadOwner]) {
//                 console.log("Missing leadOwner in userMap:", order.leadOwner);
//             }
//         });

//         // 5️⃣ Filter out orders with leadOwner role = 'Dealer'
//         orders = orders.filter(order => {
//             if (!order.leadOwner) return true;
//             const owner = userMap[order.leadOwner];
//             return owner && owner.role !== "Dealer";
//         });

//         // 6️⃣ Get all order IDs that already have payments
//         const paidOrders = await Payment.find({})
//             .select("orderId")
//             .lean();

//         const paidOrderIds = paidOrders.map(p => p.orderId.toString());

//         // 7️⃣ Filter out orders that are already paid
//         orders = orders.filter(order => !paidOrderIds.includes(order._id.toString()));

//         // 8️⃣ Format orders with srfNumberWithHospital and leadOwnerDetails
//         const formattedOrders = orders.map(order => {
//             const owner = order.leadOwner ? userMap[order.leadOwner] : null;
//             return {
//                 ...order,
//                 srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
//                 leadOwnerDetails: owner, // will now show Employee correctly
//             };
//         });

//         res.status(200).json({
//             success: true,
//             count: formattedOrders.length,
//             orders: formattedOrders,
//         });
//     } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//         });
//     }
// });


// const allOrdersWithClientName = asyncHandler(async (req, res) => {
//     try {
//         let orders = await orderModel.find({})
//             .select("srfNumber hospitalName leadOwner _id")
//             .sort({ createdAt: -1 })
//             .lean();
//         console.log("🚀 ~ orders:", orders)

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: "No orders found" });
//         }

//         // Filter valid ObjectId leadOwner values only
//         const leadOwnerIds = [
//             ...new Set(
//                 orders
//                     .map(o => o.leadOwner)
//                     .filter(id => mongoose.Types.ObjectId.isValid(id))
//             )
//         ];
//         console.log("🚀 ~ leadOwnerIds:", leadOwnerIds)

//         const users = await User.find({ _id: { $in: leadOwnerIds } })
//             .select("_id name role email")
//             .lean();
//         console.log("🚀 ~ users:", users)

//         const userMap = {};
//         users.forEach(u => (userMap[u._id.toString()] = u));

//         // Filter out Dealer orders
//         orders = orders.filter(order => {
//             if (!order.leadOwner) return true;
//             const owner = userMap[order.leadOwner];
//             return owner && owner.role !== "Dealer";
//         });

//         const paidOrders = await Payment.find({}).select("orderId").lean();
//         console.log("🚀 ~ paidOrders:", paidOrders)
//         const paidOrderIds = paidOrders.map(p => p.orderId.toString());
//         orders = orders.filter(order => !paidOrderIds.includes(order._id.toString()));

//         const formattedOrders = orders.map(order => {
//             const owner = order.leadOwner ? userMap[order.leadOwner] : null;
//             return {
//                 ...order,
//                 srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
//                 leadOwnerDetails: owner,
//             };
//         });
//         console.log("🚀 ~ formattedOrders:", formattedOrders)

//         res.status(200).json({
//             success: true,
//             count: formattedOrders.length,
//             orders: formattedOrders,
//         });
//     } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//         });
//     }
// });

// const allOrdersWithClientName = asyncHandler(async (req, res) => {
//     try {
//         let orders = await orderModel.find({})
//             .select("srfNumber hospitalName leadOwner _id")
//             .sort({ createdAt: -1 })
//             .lean();

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: "No orders found" });
//         }

//         const leadOwnerIds = [
//             ...new Set(
//                 orders
//                     .map(o => o.leadOwner)
//                     .filter(id => mongoose.Types.ObjectId.isValid(id))
//             )
//         ];

//         const users = await User.find({ _id: { $in: leadOwnerIds } })
//             .select("_id name role email")
//             .lean();

//         const userMap = {};
//         users.forEach(u => (userMap[u._id.toString()] = u));

//         const paidOrders = await Payment.find({}).select("orderId").lean();
//         const paidOrderIds = paidOrders.map(p => p.orderId.toString());

//         // 🔹 Keep only unpaid orders
//         orders = orders.filter(order => !paidOrderIds.includes(order._id.toString()));

//         const formattedOrders = orders.map(order => {
//             const owner = order.leadOwner ? userMap[order.leadOwner] : null;
//             return {
//                 ...order,
//                 srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
//                 leadOwnerDetails: owner
//             };
//         });

//         res.status(200).json({
//             success: true,
//             count: formattedOrders.length,
//             orders: formattedOrders,
//         });

//     } catch (error) {
//         console.error("❌ Error fetching orders:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Internal Server Error",
//         });
//     }
// });

//original
// const allOrdersWithClientName = asyncHandler(async (req, res) => {
//     try {
//         // 1. Fetch all orders (unpaid later)
//         let orders = await orderModel
//             .find({})
//             .select('srfNumber hospitalName leadOwner _id createdAt')
//             .sort({ createdAt: -1 })
//             .lean();

//         if (!orders || orders.length === 0) {
//             return res.status(404).json({ message: 'No orders found' });
//         }

//         // 2. Extract valid leadOwner IDs
//         const leadOwnerIds = [
//             ...new Set(
//                 orders
//                     .map(o => o.leadOwner)
//                     .filter(id => id && mongoose.Types.ObjectId.isValid(id))
//             )
//         ];

//         // 3. Fetch basic user info (name, role, email)
//         const users = await User.find({ _id: { $in: leadOwnerIds } })
//             .select('_id name role email')
//             .lean();

//         const userMap = {};
//         users.forEach(u => {
//             userMap[u._id.toString()] = {
//                 _id: u._id,
//                 name: u.name,
//                 role: u.role || 'Unknown',
//                 email: u.email,
//             };
//         });

//         // 4. Fetch custom pricing for Dealer & Manufacturer (safe query — no discriminator needed)
//         const pricingMap = {}; // This will hold qaTests + services for both roles

//         if (leadOwnerIds.length > 0) {
//             const privilegedUsers = await User.find({
//                 _id: { $in: leadOwnerIds },
//                 role: { $in: ['Dealer', 'Manufacturer'] }
//             })
//                 .select('_id role qaTests services')
//                 .lean();

//             privilegedUsers.forEach(user => {
//                 const id = user._id.toString();

//                 if (user.role === 'Dealer') {
//                     pricingMap[id] = {
//                         type: 'Dealer',
//                         qaTests: user.qaTests || [],
//                         services: []
//                     };
//                 }

//                 if (user.role === 'Manufacturer') {
//                     pricingMap[id] = {
//                         type: 'Manufacturer',
//                         qaTests: user.qaTests || [],
//                         services: user.services || [] // ← includes serviceName + amount
//                     };
//                 }
//             });
//         }

//         // 5. Get paid orders to filter them out
//         const paidOrders = await Payment.find({}).select('orderId').lean();
//         const paidOrderIds = new Set(paidOrders.map(p => p.orderId?.toString()).filter(Boolean));

//         // 6. Final enriched orders
//         const formattedOrders = orders
//             .filter(order => !paidOrderIds.has(order._id.toString()))
//             .map(order => {
//                 const owner = order.leadOwner ? userMap[order.leadOwner.toString()] : null;
//                 const pricing = order.leadOwner ? pricingMap[order.leadOwner.toString()] : null;

//                 return {
//                     ...order,
//                     srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
//                     leadOwnerDetails: owner,
//                     isPrivilegedOrder: !!pricing,
//                     pricingType: pricing?.type || null,
//                     customPricing: {
//                         qaTests: pricing?.qaTests || [],
//                         services: pricing?.services || []
//                     }
//                 };
//             });

//         res.status(200).json({
//             success: true,
//             count: formattedOrders.length,
//             orders: formattedOrders,
//         });

//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Internal Server Error',
//         });
//     }
// });


// In your order controller
const allOrdersWithClientName = asyncHandler(async (req, res) => {
    try {
        // 1. Fetch all orders (unpaid later)
        let orders = await orderModel
            .find({})
            .select('srfNumber hospitalName leadOwner _id createdAt quotation services additionalServices')
            .populate('quotation')
            .populate('services', 'machineType price quantity totalAmount')
            .populate('additionalServices', 'name totalAmount')
            .sort({ createdAt: -1 })
            .lean();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        // 2. Extract valid leadOwner IDs
        const leadOwnerIds = [
            ...new Set(
                orders
                    .map(o => o.leadOwner)
                    .filter(id => id && mongoose.Types.ObjectId.isValid(id))
            )
        ];

        // 3. Fetch basic user info (name, role, email)
        const users = await User.find({ _id: { $in: leadOwnerIds } })
            .select('_id name role email')
            .lean();

        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = {
                _id: u._id,
                name: u.name,
                role: u.role || 'Unknown',
                email: u.email,
            };
        });

        // 4. Fetch custom pricing for Dealer & Manufacturer (safe query — no discriminator needed)
        const pricingMap = {}; // This will hold qaTests + services for both roles

        if (leadOwnerIds.length > 0) {
            const privilegedUsers = await User.find({
                _id: { $in: leadOwnerIds },
                role: { $in: ['Dealer', 'Manufacturer'] }
            })
                .select('_id role qaTests services')
                .lean();

            privilegedUsers.forEach(user => {
                const id = user._id.toString();

                if (user.role === 'Dealer') {
                    pricingMap[id] = {
                        type: 'Dealer',
                        qaTests: user.qaTests || [],
                        services: []
                    };
                }

                if (user.role === 'Manufacturer') {
                    pricingMap[id] = {
                        type: 'Manufacturer',
                        qaTests: user.qaTests || [],
                        services: user.services || [] // ← includes serviceName + amount
                    };
                }
            });
        }

        // 5. Get paid orders to filter them out
        const paidOrders = await Payment.find({}).select('orderId').lean();
        const paidOrderIds = new Set(paidOrders.map(p => p.orderId?.toString()).filter(Boolean));

        // 6. Final enriched orders
        const formattedOrders = orders
            .filter(order => !paidOrderIds.has(order._id.toString()))
            .map(order => {
                const owner = order.leadOwner ? userMap[order.leadOwner.toString()] : null;
                const pricing = order.leadOwner ? pricingMap[order.leadOwner.toString()] : null;

                let breakdownServices = [];
                let breakdownSource = "Order Items";

                if (order.quotation && order.quotation.items) {
                    breakdownSource = "Quotation";
                    if (Array.isArray(order.quotation.items.services)) {
                        breakdownServices.push(...order.quotation.items.services.map(s => ({
                            serviceName: s.machineType,
                            amount: s.totalAmount || 0
                        })));
                    }
                    if (Array.isArray(order.quotation.items.additionalServices)) {
                        breakdownServices.push(...order.quotation.items.additionalServices.map(s => ({
                            serviceName: s.name,
                            amount: s.totalAmount || 0
                        })));
                    }
                } else {
                    if (Array.isArray(order.services)) {
                        breakdownServices.push(...order.services.map(s => ({
                            serviceName: s.machineType,
                            amount: s.totalAmount || s.price || 0
                        })));
                    }
                    if (Array.isArray(order.additionalServices)) {
                        breakdownServices.push(...order.additionalServices.map(s => ({
                            serviceName: s.name,
                            amount: s.totalAmount || 0
                        })));
                    }
                }

                return {
                    ...order,
                    srfNumberWithHospital: `${order.srfNumber} - ${order.hospitalName}`,
                    leadOwnerDetails: owner,
                    isPrivilegedOrder: !!pricing,
                    pricingType: pricing?.type || null,
                    customPricing: {
                        qaTests: pricing?.qaTests || [],
                        services: pricing?.services || []
                    },
                    hasPricingBreakdown: breakdownServices.length > 0,
                    breakdownSource,
                    pricingBreakdown: {
                        services: breakdownServices
                    }
                };
            });

        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            orders: formattedOrders,
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        });
    }
});
// const getTotalAmount = asyncHandler(async (req, res) => {

//     try {
//         const { orderId } = req.query; // get from query

//         if (!orderId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "orderId is required",
//             });
//         }

//         const order = await Order.findById(orderId).populate('quotation');
//         if (!order) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Order not found",
//             });
//         }

//         if (!order.quotation) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Quotation not found for this order",
//             });
//         }

//         res.status(200).json({
//             success: true,
//             totalAmount: order.quotation.total,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// });

const getTotalAmount = asyncHandler(async (req, res) => {
    const { srfNumber } = req.query;

    if (!srfNumber) {
        return res.status(400).json({ success: false, message: "SRF number is required" });
    }

    // Find order by SRF number and populate its quotation, services and additionalServices
    const order = await Order.findOne({ srfNumber })
        .populate("quotation", "total")
        .populate("services", "price totalAmount")
        .populate("additionalServices", "totalAmount");

    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    let totalAmount = 0;

    // 1. Try to get total from quotation
    if (order.quotation && order.quotation.total) {
        totalAmount = order.quotation.total;
    } else {
        // 2. Fallback: Sum up service prices and additional service prices
        const servicesTotal = (order.services || []).reduce((sum, s) => {
            // Priority: s.price (as requested) or fallback to s.totalAmount
            const price = s.price || s.totalAmount || 0;
            return sum + (Number(price) || 0);
        }, 0);

        const additionalTotal = (order.additionalServices || []).reduce((sum, s) => {
            return sum + (Number(s.totalAmount) || 0);
        }, 0);

        totalAmount = servicesTotal + additionalTotal;
    }

    res.json({
        success: true,
        totalAmount,
    });
});

const getAllPayments = asyncHandler(async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate({
                path: "orderId",
                select: "srfNumber hospitalName", // ✅ Added hospitalName
            })
            .sort({ createdAt: -1 });

        // Transform the response to include all fields
        const formattedPayments = payments.map(payment => ({
            _id: payment._id,
            paymentId: payment.paymentId,
            orderId: payment.orderId?._id,
            srfNumber: payment.orderId?.srfNumber || "N/A",
            hospitalName: payment.orderId?.hospitalName || "N/A",
            totalAmount: payment.totalAmount,
            paymentAmount: payment.paymentAmount,
            paymentType: payment.paymentType,
            utrNumber: payment.utrNumber,
            paymentMode: payment.paymentMode,  // ✅ Added paymentMode
            paymentStatus: payment.paymentStatus, // ✅ Added paymentStatus
            screenshot: payment.screenshot,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        }));

        res.status(200).json({
            success: true,
            count: formattedPayments.length,
            payments: formattedPayments,
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message,
        });
    }
});
// controllers/payment.controller.js
const getPaymentsBySrf = asyncHandler(async (req, res) => {
    const { srfNumber } = req.params; // SRF number from URL

    if (!srfNumber) {
        return res.status(400).json({ success: false, message: "SRF number is required" });
    }

    // 1. Find the order by its srfNumber
    const order = await Order.findOne({ srfNumber });
    if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 2. Find payments linked to that orderId
    const payments = await Payment.find({ orderId: order._id });

    res.status(200).json({
        success: true,
        data: payments,
        message: "Payments fetched successfully",
    });
});

// 🔹 Search payments by SRF number (example: ABSRF/2025/09/004)
const searchBySRF = asyncHandler(async (req, res) => {
    try {
        const { srfNumber } = req.query; // pass ?srfNumber=ABSRF/2025/09/004

        if (!srfNumber) {
            throw new ApiError(400, "SRF number is required");
        }

        // ✅ Find the order with given SRF number
        const order = await Order.findOne({
            srfNumber: { $regex: `^${srfNumber}`, $options: "i" }, // starts with search input, case-insensitive
        });

        if (!order) {
            throw new ApiError(404, "Order with this SRF number not found");
        }

        // ✅ Find related payments
        const payments = await Payment.find({ orderId: order._id })
            .populate("orderId", "srfNumber hospitalName")
            .sort({ createdAt: -1 });

        if (!payments || payments.length === 0) {
            throw new ApiError(404, "No payments found for this SRF number");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    srfNumber: order.srfNumber,
                    hospitalName: order.hospitalName,
                    payments: payments.map((payment) => ({
                        paymentId: payment.paymentId,
                        orderId: payment.orderId?._id,
                        totalAmount: payment.totalAmount,
                        paymentAmount: payment.paymentAmount,
                        paymentType: payment.paymentType,
                        utrNumber: payment.utrNumber,
                        screenshot: payment.screenshot,
                        createdAt: payment.createdAt,
                    })),
                },
                "Payments fetched successfully"
            )
        );
    } catch (error) {
        console.error("❌ Error searching payments by SRF:", error);
        throw new ApiError(500, error.message || "Failed to search payments");
    }
});
// const searchBySRF = asyncHandler(async (req, res) => {
//     try {
//         const { srfNumber } = req.query;
//         if (!srfNumber) {
//             throw new ApiError(400, "srfNumber query parameter is required");
//         }

//         console.log("🚀 Searching payments for SRF:", srfNumber);

//         // ✅ Step 1: Find the order by SRF first
//         const order = await Order.findOne({ srfNumber: srfNumber.trim() });
//         console.log("Order:", order?._id);
//         if (!order) {
//             throw new ApiError(404, "No order found with this SRF number");
//         }

//         // ✅ Step 2: Find payments linked to this order
//         const payments = await Payment.find({ orderId: order._id });
//         console.log("Payments:", payments);

//         if (!payments.length) {
//             throw new ApiError(404, "No payments found for this SRF number");
//         }

//         // ✅ Step 3: Map payments with order details
//         const responseData = payments.map((p) => ({
//             paymentId: p.paymentId,
//             orderId: order._id,
//             srfNumber: order.srfNumber,
//             hospitalName: order.hospitalName,
//             totalAmount: p.totalAmount,
//             paymentAmount: p.paymentAmount,
//             paymentType: p.paymentType,
//             utrNumber: p.utrNumber,
//             screenshot: p.screenshot,
//             createdAt: p.createdAt,
//             updatedAt: p.updatedAt,
//         }));

//         res.status(200).json(
//             new ApiResponse(200, { payments: responseData }, "Payments fetched successfully")
//         );
//     } catch (error) {
//         console.error("❌ Error searching payments by SRF:", error);
//         throw new ApiError(error.statusCode || 500, error.message || "Failed to search payments");
//     }
// });


const getPaymentById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Validate MongoDB ObjectId
        if (!id) {
            throw new ApiError(400, "Payment ID is required");
        }

        // ✅ Fetch payment with related Order
        const payment = await Payment.findById(id).populate("orderId", "srfNumber hospitalName");
        console.log("🚀 ~ payment:", payment);
        if (!payment) {
            throw new ApiError(404, "Payment not found");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    _id: payment._id,
                    paymentId: payment.paymentId,
                    orderId: payment.orderId?._id,
                    srfNumber: payment.orderId?.srfNumber || "N/A",
                    hospitalName: payment.orderId?.hospitalName || "N/A",
                    totalAmount: payment.totalAmount,
                    paymentAmount: payment.paymentAmount,
                    paymentType: payment.paymentType,
                    utrNumber: payment.utrNumber,
                    paymentMode: payment.paymentMode,  // ✅ Added paymentMode
                    paymentStatus: payment.paymentStatus, // ✅ Added paymentStatus
                    screenshot: payment.screenshot,
                    createdAt: payment.createdAt,
                    updatedAt: payment.updatedAt,
                },
                "Payment fetched successfully"
            )
        );
    } catch (error) {
        console.error("❌ Error fetching payment by ID:", error);
        throw new ApiError(500, error.message || "Failed to fetch payment");
    }
});

const deletePayment = asyncHandler(async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!paymentId) {
            throw new ApiError(400, "Payment ID is required");
        }

        // Try to find by _id first
        let payment = null;
        if (/^[0-9a-fA-F]{24}$/.test(paymentId)) {
            // looks like MongoDB ObjectId
            payment = await Payment.findById(paymentId);
        }

        // If not found, try by custom paymentId
        if (!payment) {
            payment = await Payment.findOne({ paymentId });
        }

        if (!payment) {
            throw new ApiError(404, "Payment not found");
        }

        // Delete payment
        await Payment.deleteOne({ _id: payment._id });

        return res.status(200).json({
            statusCode: 200,
            message: `Payment ${payment.paymentId} deleted successfully`,
            success: true,
            data: null,
            errors: [],
        });
    } catch (error) {
        console.error("❌ Error deleting payment:", error);
        throw new ApiError(error.statusCode || 500, error.message || "Failed to delete payment");
    }
});


// ✅ Get payment by ID
// export const getPaymentById = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         if (!id) {
//             return res.status(400).json({ success: false, message: "Payment ID is required" });
//         }

//         const payment = await Payment.findById(id).populate("orderId", "srfNumber hospitalName");
//         if (!payment) {
//             return res.status(404).json({ success: false, message: "Payment not found" });
//         }

//         res.status(200).json({ success: true, payment });
//     } catch (error) {
//         console.error("Error in getPaymentById:", error);
//         res.status(500).json({ success: false, message: "Failed to fetch payment" });
//     }
// });



// ✅ Edit payment by ID
const editPaymentById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const {
            srfClient,
            totalAmount,
            paymentAmount,
            paymentType,
            utrNumber,
            paymentMode,     // ✅ Added paymentMode
            paymentStatus    // ✅ Added paymentStatus
        } = req.body;

        console.log("🚀 ~ req.body:", req.body);
        console.log("🚀 ~ req.file:", req.file);

        if (!id) {
            return res.status(400).json({ success: false, message: "Payment ID is required" });
        }

        // Fetch the payment record
        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // 🧾 Update normal fields
        if (srfClient) payment.srfNumber = srfClient;
        if (totalAmount !== undefined) payment.totalAmount = totalAmount;
        if (paymentAmount !== undefined) payment.paymentAmount = paymentAmount;
        if (paymentType) payment.paymentType = paymentType.toLowerCase();
        if (utrNumber) payment.utrNumber = utrNumber;
        if (paymentMode) payment.paymentMode = paymentMode;  // ✅ Added paymentMode update
        if (paymentStatus) payment.paymentStatus = paymentStatus; // ✅ Added paymentStatus update

        // 🖼️ Handle Screenshot Upload
        if (req.file) {
            const uploaded = await uploadToS3(req.file);
            payment.screenshot = uploaded.url;
        }

        await payment.save();

        // Return updated payment with populated fields
        const updatedPayment = await Payment.findById(id).populate("orderId", "srfNumber hospitalName");

        res.status(200).json({
            success: true,
            message: "Payment updated successfully",
            payment: {
                _id: updatedPayment._id,
                paymentId: updatedPayment.paymentId,
                orderId: updatedPayment.orderId?._id,
                srfNumber: updatedPayment.orderId?.srfNumber || "N/A",
                hospitalName: updatedPayment.orderId?.hospitalName || "N/A",
                totalAmount: updatedPayment.totalAmount,
                paymentAmount: updatedPayment.paymentAmount,
                paymentType: updatedPayment.paymentType,
                utrNumber: updatedPayment.utrNumber,
                paymentMode: updatedPayment.paymentMode,  // ✅ Added in response
                paymentStatus: updatedPayment.paymentStatus, // ✅ Added in response
                screenshot: updatedPayment.screenshot,
                createdAt: updatedPayment.createdAt,
                updatedAt: updatedPayment.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error in editPaymentById:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update payment",
            error: error.message
        });
    }
});

const getPaymentDetailsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        // ✅ Validate ObjectId
        if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "Invalid orderId" });
        }

        // ✅ Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ✅ Get payments for this order
        const payments = await Payment.find({ orderId })
            .populate("orderId", "srfNumber hospitalName contactPersonName totalAmount") // populate useful fields
            .sort({ createdAt: -1 }); // latest first

        if (!payments || payments.length === 0) {
            return res.status(404).json({ message: "No payments found for this order" });
        }

        return res.status(200).json({
            success: true,
            orderId,
            totalPayments: payments.length,
            payments,
        });

    } catch (error) {
        console.error("❌ Error in getPaymentDetailsByOrderId:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching payment details",
            error: error.message,
        });
    }
};




export default { addPayment, allOrdersWithClientName, getTotalAmount, getAllPayments, getPaymentsBySrf, getPaymentById, searchBySRF, deletePayment, editPaymentById, getPaymentDetailsByOrderId };