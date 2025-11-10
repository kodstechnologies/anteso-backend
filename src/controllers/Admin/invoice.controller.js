import Order from "../../models/order.model.js";
import User from "../../models/user.model.js";
import Dealer from "../../models/dealer.model.js";
import Hospital from "../../models/hospital.model.js";
import Enquiry from '../../models/enquiry.model.js'
import { asyncHandler } from "../../utils/AsyncHandler.js";
import Invoice from "../../models/invoice.model.js";
import mongoose from "mongoose";
import { generateReadableId } from "../../utils/GenerateReadableId.js";
import Payment from "../../models/payment.model.js";
import { uploadToS3 } from "../../utils/s3Upload.js";
import { getFileUrl } from "../../utils/s3Fetch.js";

// const getAllOrdersWithType = async (req, res) => {
//   try {
//     let orders = await Order.find()
//       .populate("customer") // base user (could be Dealer or Customer/Hospital user)
//       .populate({
//         path: "quotation",
//         populate: {
//           path: "enquiry",
//           populate: { path: "hospital" }, // get hospital details
//         },
//       })
//       .lean();

//     // add type field manually
//     orders = orders.map((order) => {
//       let type = "Unknown";

//       // If customer is a Dealer (discriminator)
//       if (order.customer?.__t === "Dealer") {
//         type = "Dealer";
//       }
//       // If enquiry has hospital populated
//       else if (order.quotation?.enquiry?.hospital) {
//         type = "Hospital";
//       }

//       return { ...order, type };
//     });

//     res.status(200).json({
//       success: true,
//       data: orders,
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching orders",
//     });
//   }
// };


// const getAllOrdersWithType = async (req, res) => {
//   try {
//     let orders = await Order.find()
//       .populate("customer", "name __t") // only get name + discriminator
//       .populate({
//         path: "quotation",
//         populate: {
//           path: "enquiry",
//           populate: { path: "hospital", select: "name" }, // only get hospital name
//         },
//       })
//       .select("srfNumber quotation customer") // only keep needed fields
//       .lean();

//     const formattedOrders = orders.map((order) => {
//       let type = "Unknown";
//       let name = "";

//       if (order.customer?.__t === "Dealer") {
//         type = "Dealer";
//         name = order.customer?.name || "Unknown Dealer";
//       } else if (order.quotation?.enquiry?.hospital) {
//         type = "Hospital";
//         name = order.quotation.enquiry.hospital?.name || "Unknown Hospital";
//       }

//       return {
//         srfNumber: order.srfNumber,
//         name,
//         type,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       data: formattedOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching orders",
//     });
//   }
// };

//name of lead owner
// const getAllOrdersWithType = asyncHandler(async (req, res) => {
//   try {
//     let orders = await Order.find()
//       .populate("customer", "name __t") // only get name + discriminator
//       .populate({
//         path: "quotation",
//         populate: {
//           path: "enquiry",
//           populate: { path: "hospital", select: "name" }, // only get hospital name
//         },
//       })
//       .select("srfNumber quotation customer hospitalName leadOwner") // also fetch hospitalName & leadOwner
//       .lean();

//     const formattedOrders = orders.map((order) => {
//       let type = "Unknown";
//       let name = "";

//       if (order.customer?.__t === "Dealer") {
//         type = "Dealer";
//         name = order.customer?.name || "Unknown Dealer";
//       } else if (order.quotation?.enquiry?.hospital) {
//         type = "Hospital";
//         name = order.quotation.enquiry.hospital?.name || "Unknown Hospital";
//       } else if (order.hospitalName) {
//         // Direct Order fallback
//         type = "Hospital";
//         name = order.hospitalName;
//       } else if (order.leadOwner) {
//         // If leadOwner is filled but no hospitalName
//         type = "Dealer";
//         name = order.leadOwner;
//       }

//       return {
//         srfNumber: order.srfNumber,
//         leadOwner: order.leadOwner || null, // include leadOwner explicitly
//         name,
//         type,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       data: formattedOrders,
//     });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching orders",
//     });
//   }
// });


const getAllOrdersWithType = asyncHandler(async (req, res) => {
  try {
    // 1️⃣ Get all complete payments
    const completePayments = await Payment.find({ paymentType: "complete" })
      .populate({
        path: "orderId",
        populate: [
          { path: "customer", select: "name __t" },
          {
            path: "quotation",
            populate: {
              path: "enquiry",
              populate: { path: "hospital", select: "name" },
            },
          },
        ],
      })
      .lean();

    // 2️⃣ Format orders with payment info
    const formattedOrders = completePayments
      .filter(p => p.orderId) // ensure order exists
      .map((p) => {
        const order = p.orderId;
        let type = "Unknown";
        let name = "";

        if (order.customer?.__t === "Dealer") {
          type = "Dealer";
          name = order.customer?.name || order.leadOwner || "Unknown Dealer";
        } else if (order.quotation?.enquiry?.hospital) {
          type = "Hospital";
          name = order.quotation.enquiry.hospital?.name || "Unknown Hospital";
        } else if (order.hospitalName) {
          type = "Hospital";
          name = order.hospitalName;
        } else if (order.leadOwner) {
          type = "Dealer";
          name = order.leadOwner;
        }

        return {
          orderId: order._id,
          srfNumber: order.srfNumber,
          name,
          type,
          payment: {
            paymentId: p.paymentId,
            paymentAmount: p.paymentAmount,
            paymentType: p.paymentType,
            paymentStatus: p.paymentStatus,
          },
        };
      });

    res.status(200).json({
      success: true,
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});


// const getAllDetailsWithOrderId = asyncHandler(async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required",
//       });
//     }

//     // Fetch the order
//     const order = await Order.findById(orderId)
//       .populate("services")
//       .populate("additionalServices")
//       .populate({
//         path: "quotation",
//         select: "total discount subtotal gstRate gstAmount", // only total (grand total) from quotation
//       })
//       .lean();

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Extract grand total safely
//     const grandTotal = order.quotation?.total || 0;

//     res.status(200).json({
//       success: true,
//       data: {
//         ...order,
//         grandTotal, // attach it at the top level if you want
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching order details",
//     });
//   }
// });


// const getAllDetailsWithOrderId = asyncHandler(async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required",
//       });
//     }

//     const invoice = await Invoice.findById(orderId)
//       .populate({
//         path: "enquiry",
//         populate: [
//           {
//             path: "hospital",
//             model: "Hospital",
//             select: "name address branch phone gstNo", // ✅ hospital details
//           },
//           {
//             path: "services",
//             model: "Service",
//             select: "machineType description quantity rate hsnno", // ✅ services
//           },
//           {
//             path: "additionalServices",
//             model: "AdditionalService",
//           },
//         ],
//       })
//       .lean();

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: invoice,
//     });
//   } catch (error) {
//     console.error("Error fetching invoice details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching invoice details",
//     });
//   }
// });


// const createInvoice = asyncHandler(async (req, res) => {
//   try {
//     const {
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       taxes,
//       discountPercent,
//       services,
//       dealerHospitals,
//       orderId,        // Order ID to link payment
//       paymentType,    // advance, balance, complete
//       paymentAmount,
//       utrNumber,
//     } = req.body;
//     console.log("🚀 ~  req.body:", req.body)
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required to link invoice",
//       });
//     }

//     const orderExists = await Order.findById(orderId);
//     if (!orderExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (!srfNumber || !buyerName) {
//       return res.status(400).json({
//         success: false,
//         message: "SRF number and buyerName are required",
//       });
//     }

//     let subtotal = 0;

//     // Handle Customer type
//     if (type === "Customer") {
//       if (!services || services.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one service is required for Customer invoice",
//         });
//       }
//       subtotal = services.reduce(
//         (sum, s) => sum + Number(s.quantity) * Number(s.rate),
//         0
//       );
//     }

//     // Handle Dealer/Manufacturer type
//     if (type === "Dealer/Manufacturer") {
//       if (!dealerHospitals || dealerHospitals.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "At least one dealer hospital entry is required for Dealer/Manufacturer invoice",
//         });
//       }
//       subtotal = dealerHospitals.reduce(
//         (sum, d) => sum + Number(d.amount),
//         0
//       );
//     }

//     // Taxes
//     const taxAmounts = {};
//     let totalTax = 0;
//     ["cgst", "sgst", "igst"].forEach((tax) => {
//       if (taxes && taxes[tax] && taxes[tax].checked) {
//         const percent = parseFloat(taxes[tax].amount) || 0;
//         const taxAmount = (subtotal * percent) / 100;
//         taxAmounts[tax] = taxAmount;
//         totalTax += taxAmount;
//       } else {
//         taxAmounts[tax] = 0;
//       }
//     });

//     // Discount
//     const discountAmount = parseFloat(discountPercent) || 0;

//     // Grand total
//     const grandTotal = subtotal + totalTax - discountAmount;

//     // Generate invoiceId
//     const invoiceId = await generateReadableId("Invoice", "INV");

//     // Create Invoice
//     const newInvoice = await Invoice.create({
//       invoiceId,
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       services: type === "Customer" ? services : [],
//       dealerHospitals: type === "Dealer/Manufacturer" ? dealerHospitals : [],
//       subtotal,
//       discount: discountAmount,
//       sgst: taxAmounts.sgst,
//       cgst: taxAmounts.cgst,
//       igst: taxAmounts.igst,
//       grandtotal: grandTotal,
//       createdBy: req.user ? req.user._id : null,
//       order: orderId,
//     });

//     // If payment details are provided, create payment and link to invoice
//     if (orderId && paymentType && paymentAmount && utrNumber) {
//       const payment = await Payment.create({
//         orderId,
//         totalAmount: grandTotal,
//         paymentAmount,
//         paymentType,
//         utrNumber,
//         paymentStatus: "paid",
//       });

//       // Save payment reference and paymentType in invoice
//       newInvoice.payment = payment._id;
//       newInvoice.paymentType = payment.paymentType; // save paymentType in invoice
//       await newInvoice.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Invoice created successfully",
//       data: newInvoice,
//     });
//   } catch (error) {
//     console.error("🚀 ~ createInvoice ~ error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create invoice",
//     });
//   }
// });




// const createInvoice = asyncHandler(async (req, res) => {
//   try {
//     const {
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       taxes,
//       discountPercent,
//       services,
//       dealerHospitals,
//       orderId,        // Order ID to link payment
//       paymentType,    // advance, balance, complete
//       paymentAmount,
//       utrNumber,
//     } = req.body;
//     console.log("🚀 ~  req.body:", req.body)
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required to link invoice",
//       });
//     }

//     const orderExists = await Order.findById(orderId);
//     if (!orderExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (!srfNumber || !buyerName) {
//       return res.status(400).json({
//         success: false,
//         message: "SRF number and buyerName are required",
//       });
//     }

//     let subtotal = 0;

//     // Handle Customer type
//     if (type === "Customer") {
//       if (!services || services.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one service is required for Customer invoice",
//         });
//       }
//       subtotal = services.reduce(
//         (sum, s) => sum + Number(s.quantity) * Number(s.rate),
//         0
//       );
//     }

//     // Handle Dealer/Manufacturer type
//     if (type === "Dealer/Manufacturer") {
//       if (!dealerHospitals || dealerHospitals.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "At least one dealer hospital entry is required for Dealer/Manufacturer invoice",
//         });
//       }
//       subtotal = dealerHospitals.reduce(
//         (sum, d) => sum + Number(d.amount),
//         0
//       );
//     }

//     // Discount as percentage
//     const discountPercentNum = parseFloat(discountPercent) || 0;
//     const discountAmount = (subtotal * discountPercentNum) / 100;
//     const discountedSubtotal = subtotal - discountAmount;

//     // Taxes applied to discounted subtotal
//     const taxAmounts = {};
//     let totalTax = 0;
//     ["cgst", "sgst", "igst"].forEach((tax) => {
//       if (taxes && taxes[tax] && taxes[tax].checked) {
//         const percent = parseFloat(taxes[tax].amount) || 0;
//         const taxAmount = (discountedSubtotal * percent) / 100;
//         taxAmounts[tax] = taxAmount;
//         totalTax += taxAmount;
//       } else {
//         taxAmounts[tax] = 0;
//       }
//     });

//     // Grand total
//     const grandTotal = discountedSubtotal + totalTax;

//     // Generate invoiceId
//     const invoiceId = await generateReadableId("Invoice", "INV");

//     // Create Invoice
//     const newInvoice = await Invoice.create({
//       invoiceId,
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       services: type === "Customer" ? services : [],
//       dealerHospitals: type === "Dealer/Manufacturer" ? dealerHospitals : [],
//       subtotal,
//       totalAmount: grandTotal,
//       discount: discountAmount,
//       sgst: taxAmounts.sgst,
//       cgst: taxAmounts.cgst,
//       igst: taxAmounts.igst,
//       grandtotal: grandTotal,
//       createdBy: req.user ? req.user._id : null,
//       order: orderId,
//     });

//     // If payment details are provided, create payment and link to invoice
//     if (orderId && paymentType && paymentAmount && utrNumber) {
//       const payment = await Payment.create({
//         orderId,
//         totalAmount: grandTotal,
//         paymentAmount,
//         paymentType,
//         utrNumber,
//         paymentStatus: "paid",
//       });

//       // Save payment reference and paymentType in invoice
//       newInvoice.payment = payment._id;
//       newInvoice.paymentType = payment.paymentType; // save paymentType in invoice
//       await newInvoice.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Invoice created successfully",
//       data: newInvoice,
//     });
//   } catch (error) {
//     console.error("🚀 ~ createInvoice ~ error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create invoice",
//     });
//   }
// });


// const createInvoice = asyncHandler(async (req, res) => {
//   try {
//     const {
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       taxes,
//       discountPercent,
//       services,
//       dealerHospitals,
//       orderId,        // Order ID to link payment
//       paymentType,    // advance, balance, complete
//       paymentAmount,
//       utrNumber,
//       subtotal,       // Use directly from frontend
//       grandTotal,     // Use directly from frontend for storage
//     } = req.body;
//     console.log("🚀 ~  req.body:", req.body)
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required to link invoice",
//       });
//     }

//     const orderExists = await Order.findById(orderId);
//     if (!orderExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (!srfNumber || !buyerName) {
//       return res.status(400).json({
//         success: false,
//         message: "SRF number and buyerName are required",
//       });
//     }

//     // Use subtotal directly from frontend (as calculated there)
//     const subtotalFromFrontend = Number(subtotal) || 0;

//     // For validation, still check services/dealerHospitals presence but don't recalc subtotal
//     if (type === "Customer") {
//       if (!services || services.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one service is required for Customer invoice",
//         });
//       }
//     }

//     if (type === "Dealer/Manufacturer") {
//       if (!dealerHospitals || dealerHospitals.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "At least one dealer hospital entry is required for Dealer/Manufacturer invoice",
//         });
//       }
//     }

//     // Calculate discount as percentage (to derive discount amount for storage)
//     const discountPercentNum = parseFloat(discountPercent) || 0;
//     const discountAmount = (subtotalFromFrontend * discountPercentNum) / 100;
//     const discountedSubtotal = subtotalFromFrontend - discountAmount;

//     // Taxes applied to discounted subtotal (derive individual tax amounts for storage)
//     const taxAmounts = {};
//     let totalTax = 0;
//     ["cgst", "sgst", "igst"].forEach((tax) => {
//       if (taxes && taxes[tax] && taxes[tax].checked) {
//         const percent = parseFloat(taxes[tax].amount) || 0;
//         const taxAmount = (discountedSubtotal * percent) / 100;
//         taxAmounts[tax] = taxAmount;
//         totalTax += taxAmount;
//       } else {
//         taxAmounts[tax] = 0;
//       }
//     });

//     // Use grandTotal directly from frontend for storage (as calculated there)
//     // Note: In a production setup, you might want to verify it matches discountedSubtotal + totalTax
//     const grandTotalFromFrontend = Number(grandTotal) || 0;

//     // Generate invoiceId
//     const invoiceId = await generateReadableId("Invoice", "INV");

//     // Create Invoice using frontend-provided subtotal and grandTotal, with derived discount/taxes
//     const newInvoice = await Invoice.create({
//       invoiceId,
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       services: type === "Customer" ? services : [],
//       dealerHospitals: type === "Dealer/Manufacturer" ? dealerHospitals : [],
//       subtotal: subtotalFromFrontend,
//       totalAmount: grandTotalFromFrontend,
//       discount: discountAmount,  // Derived for storage
//       sgst: taxAmounts.sgst,    // Derived for storage
//       cgst: taxAmounts.cgst,    // Derived for storage
//       igst: taxAmounts.igst,    // Derived for storage
//       grandtotal: grandTotalFromFrontend,
//       createdBy: req.user ? req.user._id : null,
//       order: orderId,
//     });

//     // If payment details are provided, create payment and link to invoice
//     if (orderId && paymentType && paymentAmount && utrNumber) {
//       const payment = await Payment.create({
//         orderId,
//         totalAmount: grandTotalFromFrontend,
//         paymentAmount,
//         paymentType,
//         utrNumber,
//         paymentStatus: "paid",
//       });

//       // Save payment reference and paymentType in invoice
//       newInvoice.payment = payment._id;
//       newInvoice.paymentType = payment.paymentType; // save paymentType in invoice
//       await newInvoice.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Invoice created successfully",
//       data: newInvoice,
//     });
//   } catch (error) {
//     console.error("🚀 ~ createInvoice ~ error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create invoice",
//     });
//   }
// });


// const createInvoice = asyncHandler(async (req, res) => {
//   try {
//     const {
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       taxes,
//       discountPercent,
//       services,
//       dealerHospitals,
//       orderId,
//       paymentType,
//       paymentAmount,
//       utrNumber,
//       subtotal,
//       grandTotal,
//     } = req.body;

//     console.log("🚀 ~ createInvoice ~ req.body:", req.body);

//     // Validate orderId
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required to link invoice",
//       });
//     }

//     const orderExists = await Order.findById(orderId);
//     if (!orderExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Validate required fields
//     if (!srfNumber || !buyerName) {
//       return res.status(400).json({
//         success: false,
//         message: "SRF number and buyerName are required",
//       });
//     }

//     // Validate services or dealerHospitals based on type
//     if (type === "Customer") {
//       if (!services || services.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one service is required for Customer invoice",
//         });
//       }
//     } else if (type === "Dealer/Manufacturer") {
//       if ((!services || services.length === 0) && (!dealerHospitals || dealerHospitals.length === 0)) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "At least one service or dealer hospital entry is required for Dealer/Manufacturer invoice",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid invoice type",
//       });
//     }

//     // Use subtotal directly from frontend
//     const subtotalFromFrontend = Number(subtotal) || 0;

//     // Calculate discount
//     const discountPercentNum = parseFloat(discountPercent) || 0;
//     const discountAmount = (subtotalFromFrontend * discountPercentNum) / 100;
//     const discountedSubtotal = subtotalFromFrontend - discountAmount;

//     // Calculate taxes
//     const taxAmounts = {};
//     let totalTax = 0;
//     ["cgst", "sgst", "igst"].forEach((tax) => {
//       if (taxes && taxes[tax] && taxes[tax].checked) {
//         const percent = parseFloat(taxes[tax].amount) || 0;
//         const taxAmount = (discountedSubtotal * percent) / 100;
//         taxAmounts[tax] = taxAmount;
//         totalTax += taxAmount;
//       } else {
//         taxAmounts[tax] = 0;
//       }
//     });

//     // Use grandTotal from frontend
//     const grandTotalFromFrontend = Number(grandTotal) || 0;

//     // Generate invoiceId
//     const invoiceId = await generateReadableId("Invoice", "INV");

//     // Create Invoice
//     const newInvoice = await Invoice.create({
//       invoiceId,
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       services: services || [], // Allow services for both types
//       dealerHospitals: type === "Dealer/Manufacturer" ? dealerHospitals || [] : [],
//       subtotal: subtotalFromFrontend,
//       totalAmount: grandTotalFromFrontend,
//       discount: discountAmount,
//       sgst: taxAmounts.sgst,
//       cgst: taxAmounts.cgst,
//       igst: taxAmounts.igst,
//       grandtotal: grandTotalFromFrontend,
//       createdBy: req.user ? req.user._id : null,
//       order: orderId,
//       paymentType,
//     });

//     // Create payment if details provided
//     if (orderId && paymentType && paymentAmount && utrNumber) {
//       const payment = await Payment.create({
//         orderId,
//         totalAmount: grandTotalFromFrontend,
//         paymentAmount,
//         paymentType,
//         utrNumber,
//         paymentStatus: "paid",
//       });

//       newInvoice.payment = payment._id;
//       newInvoice.paymentType = payment.paymentType;
//       await newInvoice.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Invoice created successfully",
//       data: newInvoice,
//     });
//   } catch (error) {
//     console.error("🚀 ~ createInvoice ~ error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create invoice",
//     });
//   }
// });


// const createInvoice = asyncHandler(async (req, res) => {
//   try {
//     const {
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       taxes,
//       discountPercent,
//       services,
//       additionalServices,
//       dealerHospitals,
//       orderId,
//       paymentType,
//       paymentAmount,
//       utrNumber,
//       subtotal,
//       grandTotal,
//     } = req.body;

//     console.log("🚀 ~ createInvoice ~ req.body:", req.body);

//     // Validate orderId
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required to link invoice",
//       });
//     }

//     const orderExists = await Order.findById(orderId);
//     if (!orderExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Validate required fields
//     if (!srfNumber || !buyerName) {
//       return res.status(400).json({
//         success: false,
//         message: "SRF number and buyerName are required",
//       });
//     }

//     // Validate services or dealerHospitals based on type
//     if (type === "Customer") {
//       if (!services || services.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one service is required for Customer invoice",
//         });
//       }
//     } else if (type === "Dealer/Manufacturer") {
//       if (
//         (!services || services.length === 0) &&
//         (!dealerHospitals || dealerHospitals.length === 0)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "At least one service or dealer hospital entry is required for Dealer/Manufacturer invoice",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid invoice type",
//       });
//     }

//     // Use subtotal directly from frontend
//     const subtotalFromFrontend = Number(subtotal) || 0;

//     // Calculate discount
//     const discountPercentNum = parseFloat(discountPercent) || 0;
//     const discountAmount = (subtotalFromFrontend * discountPercentNum) / 100;
//     const discountedSubtotal = subtotalFromFrontend - discountAmount;

//     // Calculate taxes
//     const taxAmounts = {};
//     let totalTax = 0;
//     ["cgst", "sgst", "igst"].forEach((tax) => {
//       if (taxes && taxes[tax] && taxes[tax].checked) {
//         const percent = parseFloat(taxes[tax].amount) || 0;
//         const taxAmount = (discountedSubtotal * percent) / 100;
//         taxAmounts[tax] = taxAmount;
//         totalTax += taxAmount;
//       } else {
//         taxAmounts[tax] = 0;
//       }
//     });

//     // Use grandTotal from frontend
//     const grandTotalFromFrontend = Number(grandTotal) || 0;

//     // Generate invoiceId
//     const invoiceId = await generateReadableId("Invoice", "INV");

//     // Create Invoice
//     const newInvoice = await Invoice.create({
//       invoiceId,
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       services: services || [],
//       additionalServices: additionalServices || [], // Include additionalServices
//       dealerHospitals: type === "Dealer/Manufacturer" ? dealerHospitals || [] : [],
//       subtotal: subtotalFromFrontend,
//       totalAmount: grandTotalFromFrontend,
//       discount: discountAmount,
//       sgst: taxAmounts.sgst,
//       cgst: taxAmounts.cgst,
//       igst: taxAmounts.igst,
//       grandtotal: grandTotalFromFrontend,
//       createdBy: req.user ? req.user._id : null,
//       order: orderId,
//       paymentType,
//     });

//     // Create payment if details provided
//     if (orderId && paymentType && paymentAmount && utrNumber) {
//       const payment = await Payment.create({
//         orderId,
//         totalAmount: grandTotalFromFrontend,
//         paymentAmount,
//         paymentType,
//         utrNumber,
//         paymentStatus: "paid",
//       });

//       newInvoice.payment = payment._id;
//       newInvoice.paymentType = payment.paymentType;
//       await newInvoice.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Invoice created successfully",
//       data: newInvoice,
//     });
//   } catch (error) {
//     console.error("🚀 ~ createInvoice ~ error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create invoice",
//     });
//   }
// });

// const createInvoice = asyncHandler(async (req, res) => {
//   try {
//     const {
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       taxes,
//       discountPercent,
//       services,
//       additionalServices,
//       dealerHospitals,
//       orderId,
//       paymentType,
//       paymentAmount,
//       utrNumber,
//       subtotal,
//       grandTotal,
//     } = req.body;

//     console.log("🚀 ~ createInvoice ~ req.body:", JSON.stringify(req.body, null, 2));
//     console.log("🚀 ~ createInvoice ~ additionalServices:", additionalServices);

//     // Validate orderId
//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required to link invoice",
//       });
//     }

//     const orderExists = await Order.findById(orderId);
//     if (!orderExists) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Validate required fields
//     if (!srfNumber || !buyerName) {
//       return res.status(400).json({
//         success: false,
//         message: "SRF number and buyerName are required",
//       });
//     }

//     // Validate services or dealerHospitals based on type
//     if (type === "Customer") {
//       if (!services || services.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: "At least one service is required for Customer invoice",
//         });
//       }
//     } else if (type === "Dealer/Manufacturer") {
//       if (
//         (!services || services.length === 0) &&
//         (!dealerHospitals || dealerHospitals.length === 0)
//       ) {
//         return res.status(400).json({
//           success: false,
//           message:
//             "At least one service or dealer hospital entry is required for Dealer/Manufacturer invoice",
//         });
//       }
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid invoice type",
//       });
//     }

//     // Use subtotal directly from frontend
//     const subtotalFromFrontend = Number(subtotal) || 0;

//     // Calculate discount
//     const discountPercentNum = parseFloat(discountPercent) || 0;
//     const discountAmount = (subtotalFromFrontend * discountPercentNum) / 100;
//     const discountedSubtotal = subtotalFromFrontend - discountAmount;

//     // Calculate taxes
//     const taxAmounts = {};
//     let totalTax = 0;
//     ["cgst", "sgst", "igst"].forEach((tax) => {
//       if (taxes && taxes[tax] && taxes[tax].checked) {
//         const percent = parseFloat(taxes[tax].amount) || 0;
//         const taxAmount = (discountedSubtotal * percent) / 100;
//         taxAmounts[tax] = taxAmount;
//         totalTax += taxAmount;
//       } else {
//         taxAmounts[tax] = 0;
//       }
//     });

//     // Use grandTotal from frontend
//     const grandTotalFromFrontend = Number(grandTotal) || 0;

//     // Generate invoiceId
//     const invoiceId = await generateReadableId("Invoice", "INV");

//     // Ensure additionalServices is an array, even if empty
//     const formattedAdditionalServices = Array.isArray(additionalServices) ? additionalServices : [];

//     // Create Invoice
//     const newInvoice = await Invoice.create({
//       invoiceId,
//       type,
//       srfNumber,
//       buyerName,
//       address,
//       state,
//       remarks,
//       services: services || [],
//       additionalServices: formattedAdditionalServices, // Explicitly set additionalServices
//       dealerHospitals: type === "Dealer/Manufacturer" ? dealerHospitals || [] : [],
//       subtotal: subtotalFromFrontend,
//       totalAmount: grandTotalFromFrontend,
//       discount: discountAmount,
//       sgst: taxAmounts.sgst,
//       cgst: taxAmounts.cgst,
//       igst: taxAmounts.igst,
//       grandtotal: grandTotalFromFrontend,
//       createdBy: req.user ? req.user._id : null,
//       order: orderId,
//       paymentType,
//     });

//     // Create payment if details provided
//     if (orderId && paymentType && paymentAmount && utrNumber) {
//       const payment = await Payment.create({
//         orderId,
//         totalAmount: grandTotalFromFrontend,
//         paymentAmount,
//         paymentType,
//         utrNumber,
//         paymentStatus: "paid",
//       });

//       newInvoice.payment = payment._id;
//       newInvoice.paymentType = payment.paymentType;
//       await newInvoice.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Invoice created successfully",
//       data: newInvoice,
//     });
//   } catch (error) {
//     console.error("🚀 ~ createInvoice ~ error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message || "Failed to create invoice",
//     });
//   }
// });


// const getAllDetailsWithOrderId = asyncHandler(async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required",
//       });
//     }

//     // Fetch the order
//     const order = await Order.findById(orderId)
//       .populate("services")
//       .populate("additionalServices")
//       .populate({
//         path: "quotation",
//         select: "total discount subtotal gstRate gstAmount",
//       })
//       .populate({
//         path: "dealerHospitals",
//         populate: [
//           { path: "services" },
//           { path: "additionalServices" },
//         ],
//       })
//       .lean();

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Extract grand total safely
//     const grandTotal = order.quotation?.total || 0;

//     // Format dealerHospitals to include nested services and additionalServices
//     const formattedDealerHospitals = order.dealerHospitals?.map(dh => ({
//       ...dh,
//       services: dh.services || [],
//       additionalServices: dh.additionalServices || [],
//     })) || [];

//     res.status(200).json({
//       success: true,
//       data: {
//         ...order,
//         dealerHospitals: formattedDealerHospitals,
//         grandTotal,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching order details",
//     });
//   }
// });


// const getAllDetailsWithOrderId = asyncHandler(async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required",
//       });
//     }

//     // Fetch the order
//     const order = await Order.findById(orderId)
//       .populate({
//         path: 'services',
//         select: 'machineType totalAmount machineModel workTypeDetails',
//       })
//       .populate({
//         path: 'additionalServices',
//         select: 'name description totalAmount',
//       })
//       .populate({
//         path: 'quotation',
//         select: 'total discount subtotal gstRate gstAmount',
//       })
//       .lean();
//     console.log("🚀 ~ order:", order)

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // Extract grand total safely
//     const grandTotal = order.quotation?.total || 0;

//     res.status(200).json({
//       success: true,
//       data: {
//         ...order,
//         grandTotal,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching order details",
//     });
//   }
// });


// const getAllDetailsWithOrderId = asyncHandler(async (req, res) => {
//   try {
//     const { orderId } = req.params;

//     if (!orderId) {
//       return res.status(400).json({
//         success: false,
//         message: "orderId is required",
//       });
//     }

//     const order = await Order.findById(orderId)
//       .populate({
//         path: 'services',
//         select: 'machineType machineModel totalAmount workTypeDetails',
//       })
//       .populate({
//         path: 'additionalServices',
//         select: 'name description totalAmount',
//       })
//       .populate({
//         path: 'quotation',
//         select: 'total discount subtotal gstRate gstAmount',
//       })
//       .lean();

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     // ✅ Ensure service totals are handled
//     const servicesWithAmount = order.services.map(s => ({
//       ...s,
//       totalAmount: s.totalAmount || 0,
//     }));

//     const serviceTotal = servicesWithAmount.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
//     const additionalTotal = order.additionalServices?.reduce((sum, s) => sum + (s.totalAmount || 0), 0) || 0;
//     const quotationTotal = order.quotation?.total || 0;

//     const grandTotal = quotationTotal || (serviceTotal + additionalTotal);

//     res.status(200).json({
//       success: true,
//       data: {
//         ...order,
//         services: servicesWithAmount,
//         grandTotal,
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching order details:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching order details",
//     });
//   }
// });

const getAllDetailsWithOrderId = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: 'services',
        select: 'machineType machineModel totalAmount workTypeDetails quantity',
      })
      .populate({
        path: 'additionalServices',
        select: 'name description totalAmount',
      })
      .populate({
        path: 'quotation',
        select: 'total discount subtotal gstRate gstAmount enquiry',
        populate: {
          path: 'enquiry',
          populate: { path: 'services', select: 'machineType totalAmount' }
        }
      })
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // 🧮 Use service totals from quotation.enquiry if available
    let servicesWithAmount = order.services;
    if (order.quotation?.enquiry?.services?.length) {
      const enquiryServices = order.quotation.enquiry.services;
      servicesWithAmount = order.services.map(s => {
        const matched = enquiryServices.find(es => es.machineType === s.machineType);
        return {
          ...s,
          totalAmount: matched?.totalAmount || s.totalAmount || 0,
        };
      });
    }

    const serviceTotal = servicesWithAmount.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const additionalTotal = order.additionalServices?.reduce((sum, s) => sum + (s.totalAmount || 0), 0) || 0;
    const quotationTotal = order.quotation?.total || 0;
    const grandTotal = quotationTotal || (serviceTotal + additionalTotal);

    res.status(200).json({
      success: true,
      data: {
        ...order,
        services: servicesWithAmount,
        grandTotal,
      },
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order details",
    });
  }
});



const createInvoice = asyncHandler(async (req, res) => {
  try {
    const {
      type,
      srfNumber,
      buyerName,
      address,
      state,
      remarks,
      taxes,
      discountPercent,
      services,
      additionalServices,
      dealerHospitals,
      orderId,
      paymentType,
      paymentAmount,
      utrNumber,
      subtotal,
      grandTotal,
    } = req.body;

    console.log("🚀 ~ createInvoice ~ req.body:", JSON.stringify(req.body, null, 2));
    console.log("🚀 ~ createInvoice ~ additionalServices:", additionalServices);
    console.log("🚀 ~ createInvoice ~ dealerHospitals:", dealerHospitals);

    // Validate orderId
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required to link invoice",
      });
    }

    const orderExists = await Order.findById(orderId);
    if (!orderExists) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Validate required fields
    if (!srfNumber || !buyerName) {
      return res.status(400).json({
        success: false,
        message: "SRF number and buyerName are required",
      });
    }

    // Validate services or dealerHospitals based on type
    if (type === "Customer") {
      if (!services || services.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one service is required for Customer invoice",
        });
      }
    } else if (type === "Dealer/Manufacturer") {
      if (!dealerHospitals || dealerHospitals.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one dealer hospital entry is required for Dealer/Manufacturer invoice",
        });
      }
      // Validate nested services/additionalServices for each dealer hospital
      for (const [index, dh] of dealerHospitals.entries()) {
        if (
          (!dh.services || dh.services.length === 0) &&
          (!dh.additionalServices || dh.additionalServices.length === 0)
        ) {
          return res.status(400).json({
            success: false,
            message: `At least one service or additional service is required for dealer hospital at index ${index}`,
          });
        }
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice type",
      });
    }

    // Use subtotal directly from frontend
    const subtotalFromFrontend = Number(subtotal) || 0;

    // Calculate discount
    const discountPercentNum = parseFloat(discountPercent) || 0;
    const discountAmount = (subtotalFromFrontend * discountPercentNum) / 100;
    const discountedSubtotal = subtotalFromFrontend - discountAmount;

    // Calculate taxes
    const taxAmounts = {};
    let totalTax = 0;
    ["cgst", "sgst", "igst"].forEach((tax) => {
      if (taxes && taxes[tax] && taxes[tax].checked) {
        const percent = parseFloat(taxes[tax].amount) || 0;
        const taxAmount = (discountedSubtotal * percent) / 100;
        taxAmounts[tax] = taxAmount;
        totalTax += taxAmount;
      } else {
        taxAmounts[tax] = 0;
      }
    });

    // Use grandTotal from frontend
    const grandTotalFromFrontend = Number(grandTotal) || 0;

    // Generate invoiceId
    const invoiceId = await generateReadableId("Invoice", "INV");

    // Ensure additionalServices is an array, even if empty
    const formattedAdditionalServices = Array.isArray(additionalServices) ? additionalServices : [];

    // Format dealerHospitals to ensure nested arrays
    const formattedDealerHospitals = type === "Dealer/Manufacturer"
      ? dealerHospitals.map(dh => ({
        ...dh,
        services: Array.isArray(dh.services) ? dh.services : [],
        additionalServices: Array.isArray(dh.additionalServices) ? dh.additionalServices : [],
      }))
      : [];

    // Create Invoice
    const newInvoice = await Invoice.create({
      invoiceId,
      type,
      srfNumber,
      buyerName,
      address,
      state,
      remarks,
      services: type === "Customer" ? services || [] : [], // Only for Customer invoices
      additionalServices: type === "Customer" ? formattedAdditionalServices : [], // Only for Customer invoices
      dealerHospitals: formattedDealerHospitals,
      subtotal: subtotalFromFrontend,
      totalAmount: grandTotalFromFrontend,
      discount: discountAmount,
      sgst: taxAmounts.sgst,
      cgst: taxAmounts.cgst,
      igst: taxAmounts.igst,
      grandtotal: grandTotalFromFrontend,
      createdBy: req.user ? req.user._id : null,
      order: orderId,
      paymentType,
    });

    // Create payment if details provided
    if (orderId && paymentType && paymentAmount && utrNumber) {
      const payment = await Payment.create({
        orderId,
        totalAmount: grandTotalFromFrontend,
        paymentAmount,
        paymentType,
        utrNumber,
        paymentStatus: "paid",
      });

      newInvoice.payment = payment._id;
      newInvoice.paymentType = payment.paymentType;
      await newInvoice.save();
    }

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: newInvoice,
    });
  } catch (error) {
    console.error("🚀 ~ createInvoice ~ error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create invoice",
    });
  }
});

const getDealerOrders = asyncHandler(async (req, res) => {
  try {
    // Step 1: Fetch all dealer _ids
    const dealers = await Dealer.find({}, "_id");
    const dealerIds = dealers.map((d) => d._id.toString());

    // Step 2: Find orders whose leadOwner matches any dealer _id
    const dealerOrders = await Order.find(
      { leadOwner: { $in: dealerIds } },
      { _id: 1, srfNumber: 1 } // only return id and srfNumber
    );

    // Step 3: Return result
    res.status(200).json({
      success: true,
      count: dealerOrders.length,
      data: dealerOrders,
    });
  } catch (error) {
    console.error("❌ Error fetching dealer orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dealer orders",
    });
  }
});



// const getInvoiceById = asyncHandler(async (req, res) => {
//   try {
//     const { invoiceId } = req.params;

//     // Validate invoiceId
//     if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
//       return res.status(400).json({ success: false, message: "Invalid invoice ID" });
//     }

//     // Fetch invoice with optional population of enquiry
//     const invoice = await Invoice.findById(invoiceId).populate("enquiry");

//     if (!invoice) {
//       return res.status(404).json({ success: false, message: "Invoice not found" });
//     }

//     res.status(200).json({ success: true, data: invoice });
//   } catch (error) {
//     console.error("Error fetching invoice:", error);
//     res.status(500).json({
//       success: false,
//       message: error?.message || "Failed to fetch invoice",
//     });
//   }
// });




// const getInvoiceById = asyncHandler(async (req, res) => {
//   try {
//     const { invoiceId } = req.params;
//     console.log("🚀 ~ invoiceId:", invoiceId)

//     // Validate invoiceId
//     if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
//       return res.status(400).json({ success: false, message: "Invalid invoice ID" });
//     }

//     // Fetch invoice with optional population of enquiry and order
//     const invoice = await Invoice.findById(invoiceId)
//       .populate("enquiry")
//       .populate("order"); // ✅ populate order to get orderId and other details
//     console.log("🚀 ~ invoice:", invoice)

//     if (!invoice) {
//       return res.status(404).json({ success: false, message: "Invoice not found" });
//     }

//     // If you want to return orderId only
//     const invoiceData = {
//       ...invoice.toObject(),
//       orderId: invoice.order?._id, // add orderId explicitly
//     };

//     res.status(200).json({ success: true, data: invoiceData });
//   } catch (error) {
//     console.error("Error fetching invoice:", error);
//     res.status(500).json({
//       success: false,
//       message: error?.message || "Failed to fetch invoice",
//     });
//   }
// });


export const getInvoiceById = asyncHandler(async (req, res) => {
  try {
    const { invoiceId } = req.params;
    console.log("🚀 ~ invoiceId:", invoiceId);

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(invoiceId)) {
      return res.status(400).json({ success: false, message: "Invalid invoice ID" });
    }

    // ✅ Populate invoice → order → services, additionalServices, hospital
    const invoice = await Invoice.findById(invoiceId)
      .populate("enquiry")
      .populate({
        path: "order",
        populate: [
          { path: "services", model: "Service" },
          { path: "additionalServices", model: "AdditionalService" },
          { path: "hospital", model: "Hospital" }, // ✅ populate hospital details too
        ],
      });

    console.log("🚀 ~ invoice:", invoice);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // ✅ Attach orderId for frontend
    const invoiceData = {
      ...invoice.toObject(),
      orderId: invoice.order?._id,
    };

    res.status(200).json({ success: true, data: invoiceData });
  } catch (error) {
    console.error("❌ Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch invoice",
    });
  }
});

// export const getInvoiceById = asyncHandler(async (req, res) => {
//   try {
//     const { invoiceId } = req.params;
//     console.log("🚀 ~ invoiceId:", invoiceId);

//     if (!invoiceId) {
//       return res.status(400).json({ success: false, message: "Invoice ID is required" });
//     }

//     // ✅ Find by custom invoiceId field (not MongoDB _id)
//     const invoice = await Invoice.findOne({ invoiceId })
//       .populate("enquiry")
//       .populate({
//         path: "order",
//         populate: [
//           { path: "services", model: "Service" },
//           { path: "additionalServices", model: "AdditionalService" },
//           { path: "hospital", model: "Hospital" }, // ✅ populate hospital details too
//         ],
//       });

//     console.log("🚀 ~ invoice:", invoice);

//     if (!invoice) {
//       return res.status(404).json({ success: false, message: "Invoice not found" });
//     }

//     // ✅ Attach orderId for frontend if order exists
//     const invoiceData = {
//       ...invoice.toObject(),
//       orderId: invoice.order?._id,
//     };

//     res.status(200).json({ success: true, data: invoiceData });
//   } catch (error) {
//     console.error("❌ Error fetching invoice:", error);
//     res.status(500).json({
//       success: false,
//       message: error?.message || "Failed to fetch invoice",
//     });
//   }
// });

const getAllInvoices = asyncHandler(async (req, res) => {
  try {
    // Fetch all invoices, populate 'enquiry' and 'payment' to get paymentType
    const invoices = await Invoice.find()
      .sort({ createdAt: -1 }) // latest first
      .populate("enquiry") // populate enquiry if needed
      .populate({
        path: "payment",
        select: "paymentType paymentAmount paymentStatus utrNumber", // select the fields you need
      });
    console.log("🚀 ~ invoices:", invoices)

    res.status(200).json({
      success: true,
      data: invoices,
      count: invoices.length,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch invoices",
    });
  }
});

// DELETE /invoice/:id
const deleteInvoice = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required",
      });
    }

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // ✅ Use deleteOne instead of remove
    await Invoice.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to delete invoice",
    });
  }
});

// const uploadInvoicePdf = asyncHandler(async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const file = req.file;

//     if (!orderId) {
//       return res.status(400).json({ success: false, message: "orderId is required" });
//     }

//     if (!file) {
//       return res.status(400).json({ success: false, message: "invoicePdf file is required" });
//     }

//     // Find invoice by orderId
//     const invoice = await Invoice.findOne({ order: orderId });
//     if (!invoice) {
//       return res.status(404).json({ success: false, message: "Invoice not found for this orderId" });
//     }

//     // Upload file to S3
//     const { url } = await uploadToS3(file);

//     // Save S3 URL in invoice
//     invoice.invoicePdf = url;
//     await invoice.save();

//     res.status(200).json({
//       success: true,
//       message: "Invoice PDF uploaded to S3 successfully",
//       data: invoice,
//     });
//   } catch (error) {
//     console.error("Error uploading invoice PDF:", error);
//     res.status(500).json({
//       success: false,
//       message: error?.message || "Failed to upload invoice PDF",
//     });
//   }
// });

const uploadInvoicePdf = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const file = req.file;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "orderId is required" });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: "invoicePdf file is required" });
    }

    // 🔍 Find invoice by orderId
    const invoice = await Invoice.findOne({ order: orderId });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found for this orderId" });
    }

    // 📤 Upload file to S3
    const { url } = await uploadToS3(file);

    // ✅ Update invoice fields
    invoice.invoicePdf = url;
    invoice.invoiceuploaded = true; // <-- Mark as uploaded
    await invoice.save();

    res.status(200).json({
      success: true,
      message: "Invoice PDF uploaded and marked as uploaded successfully",
      data: invoice,
    });
  } catch (error) {
    console.error("❌ Error uploading invoice PDF:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to upload invoice PDF",
    });
  }
});


const getInvoicePdf = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log("🚀 ~ getInvoicePdf ~ orderId:", orderId);

    // 1️⃣ Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // 2️⃣ Find invoice linked with this order
    const invoice = await Invoice.findOne({ order: orderId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found for this order",
      });
    }

    // 3️⃣ Check for stored invoicePdf URL
    if (!invoice.invoicePdf) {
      return res.status(404).json({
        success: false,
        message: "No invoice PDF found for this order",
      });
    }

    // 4️⃣ Send database-stored invoicePdf URL
    res.status(200).json({
      success: true,
      data: {
        orderId,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceId,
        invoicePdf: invoice.invoicePdf, // direct DB value (URL)
      },
    });
  } catch (error) {
    console.error("❌ Error in getInvoicePdf:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to retrieve invoice PDF",
    });
  }
});



export default { getAllOrdersWithType, getAllDetailsWithOrderId, createInvoice, getInvoiceById, getAllInvoices, deleteInvoice, uploadInvoicePdf, getInvoicePdf, getDealerOrders }