import { asyncHandler } from "../../utils/AsyncHandler.js";
import Enquiry from "../../models/enquiry.model.js";
import Quotation from "../../models/quotation.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import orderModel from "../../models/order.model.js";
import mongoose from "mongoose";
import Services from "../../models/Services.js";
import AdditionalService from '../../models/additionalService.model.js'
import { uploadToS3 } from "../../utils/s3Upload.js";
import counterModel from "../../models/counter.model.js";
import QuotationHistory from "../../routes/allRoutes/Admin/quotationHistory.model.js";


// export const createQuotationByEnquiryId = asyncHandler(async (req, res) => {
//     const { enquiryId } = req.params;

//     // Fetch enquiry using the ObjectId
//     const enquiry = await Enquiry.findById(enquiryId);

//     if (!enquiry) {
//         throw new ApiError(404, "Enquiry not found");
//     }

//     // You may customize discount, terms, total, etc. from req.body
//     const { discount = 0, total, from, termsAndConditions = [] } = req.body;

//     if (!total || !from) {
//         throw new ApiError(400, "Total and From (user ID) are required");
//     }

//     // Create new quotation
//     const newQuotation = await Quotation.create({
//         enquiry: enquiry._id,
//         from,
//         discount,
//         total,
//         termsAndConditions,
//         quotationStatus: "Created", // or 'Create' if you want to edit later
//     });

//     // Optional: Update enquiry's quotationStatus field with reference
//     enquiry.quotationStatus = newQuotation._id;
//     enquiry.enquiryStatus = 'Quotation Sent';
//     enquiry.enquiryStatusDates.quotationSentOn = new Date();
//     await enquiry.save();

//     res.status(201).json(
//         new ApiResponse(201, newQuotation, "Quotation created successfully")
//     );
// });


// const createQuotationByEnquiryId = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log("Incoming Quotation Payload:----->", req.body)

//         console.log("🚀 ~ enquiryId:", id)
//         const {
//             date,
//             quotationNumber,
//             expiryDate,
//             customer,
//             assignedEmployee,
//             termsAndConditions,
//             calculations,
//             items,
//         } = req.body;
//         console.log("🚀 ~ customer-------------->:", customer)

//         if (!assignedEmployee || !calculations || !items) {
//             throw new ApiError(400, 'Missing required fields');
//         }

//         // Now directly fetch by enquiry ID
//         const enquiry = await Enquiry.findById(id).populate("customer");
//         console.log("enquiry.customer:", enquiry.customer);

//         if (!enquiry) throw new ApiError(404, "Enquiry not found");
//         if (!enquiry.customer || !enquiry.customer._id)
//             throw new ApiError(400, "Customer info missing in enquiry");
//         console.log("Terms to be saved:", termsAndConditions);

//         const quotation = await Quotation.create({
//             date,
//             quotationId: quotationNumber,
//             enquiry: enquiry._id,
//             from: enquiry.customer._id,
//             discount: calculations.discount,
//             total: calculations.totalAmount,
//             quotationStatus: 'Created',
//             termsAndConditions,
//         });

//         console.log("Created Quotation:", quotation);
//         await Enquiry.findByIdAndUpdate(enquiry._id, {
//             quotationStatus: quotation.quotationStatus,
//             "enquiryStatusDates.quotationSentOn": quotation.date || new Date(),
//         });
//         return res
//             .status(201)
//             .json(new ApiResponse(201, quotation, 'Quotation created successfully'));
//     } catch (error) {
//         console.error("Error creating quotation:", error);
//         throw new ApiError(500, 'Failed to create quotation', [error.message]);
//     }
// });
// const createQuotationByEnquiryId = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             date,
//             quotationNumber,
//             customer,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//         } = req.body;

//         console.log("🚀 ~ req.body:", req.body);

//         if (!assignedEmployee) throw new ApiError(400, 'Assigned employee is required');

//         // Fetch enquiry to check if it exists
//         const enquiry = await Enquiry.findById(id).populate('customer');
//         if (!enquiry) throw new ApiError(404, 'Enquiry not found');
//         if (!enquiry.customer || !enquiry.customer._id)
//             throw new ApiError(400, 'Customer info missing in enquiry');

//         // Create quotation using frontend-calculated values
//         const quotation = await Quotation.create({
//             date,
//             quotationId: quotationNumber,
//             enquiry: enquiry._id,
//             from: enquiry.customer._id,
//             customer,
//             assignedEmployee,
//             items,
//             calculations,
//             bankDetails,
//             companyDetails,
//             discount: calculations?.discountAmount || 0,
//             total: calculations?.totalAmount || 0,
//             quotationStatus: 'Created',
//             termsAndConditions,
//         });

//         // Update enquiry with quotation status and date
//         await Enquiry.findByIdAndUpdate(enquiry._id, {
//             quotationStatus: quotation.quotationStatus,
//             "enquiryStatusDates.quotationSentOn": quotation.date || new Date(),
//             subtotalAmount: calculations?.subtotal || 0,
//             discount: calculations?.discountAmount || 0,
//             grandTotal: calculations?.totalAmount || 0
//         });

//         return res.status(201).json(
//             new ApiResponse(201, quotation, 'Quotation created successfully')
//         );

//     } catch (error) {
//         console.error("Error creating quotation:", error);
//         throw new ApiError(500, 'Failed to create quotation', [error.message]);
//     }
// });
// const createQuotationByEnquiryId = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             date,
//             quotationNumber,
//             customer,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//         } = req.body;

//         console.log("🚀 ~ req.body:", req.body);

//         if (!assignedEmployee) throw new ApiError(400, 'Assigned employee is required');

//         // Fetch enquiry and populate services/additional services
//         const enquiry = await Enquiry.findById(id)
//             .populate('services')
//             .populate('additionalServices')
//             .populate('customer');
//         if (!enquiry) throw new ApiError(404, 'Enquiry not found');
//         if (!enquiry.customer || !enquiry.customer._id)
//             throw new ApiError(400, 'Customer info missing in enquiry');
//         // Create snapshots of services with totalAmount
//         // const serviceSnapshots = items.services.map(s => ({
//         //     id: s.id,
//         //     machineType: s.machineType,
//         //     equipmentNo: s.equipmentNo,
//         //     machineModel: s.machineModel,
//         //     serialNumber: s.serialNumber,
//         //     remark: s.remark,
//         //     totalAmount: s.totalAmount, // directly from frontend
//         // }));

//         const serviceSnapshots = items.services.map(s => ({
//             id: s.id, // frontend sends real ObjectId
//             machineType: s.machineType,
//             equipmentNo: s.equipmentNo,
//             machineModel: s.machineModel,
//             serialNumber: s.serialNumber,
//             remark: s.remark,
//             totalAmount: s.totalAmount, //  directly from frontend
//         }));
//         console.log("Service snapshots for DB update:", serviceSnapshots);


//         const additionalServiceSnapshots = items.additionalServices.map(s => ({
//             id: s.id,
//             name: s.name,
//             description: s.description,
//             totalAmount: s.totalAmount, // directly from frontend
//         }));


//         // Create quotation with service snapshots and other data
//         const quotation = await Quotation.create({
//             date,
//             quotationId: quotationNumber,
//             enquiry: enquiry._id,
//             from: enquiry.customer._id,
//             customer,
//             assignedEmployee,
//             items: {
//                 services: serviceSnapshots,
//                 additionalServices: additionalServiceSnapshots,
//             },
//             calculations,
//             bankDetails,
//             companyDetails,
//             discount: calculations?.discountAmount || 0,
//             total: calculations?.totalAmount || 0,
//             quotationStatus: 'Created',
//             termsAndConditions,
//         });

//         // **Update the actual Service and AdditionalService totals in DB**
//         // Update the actual Service and AdditionalService totals in DB

//         await Promise.all(serviceSnapshots
//             .filter(s => mongoose.Types.ObjectId.isValid(s.id)) // ✅ only update valid ids
//             .map(s => Services.findByIdAndUpdate(
//                 s.id,
//                 { $set: { totalAmount: s.totalAmount } },
//                 { new: true }
//             ))
//         );


//         await Promise.all(additionalServiceSnapshots
//             .filter(s => s.id) // ✅ same for additional services
//             .map(s => AdditionalService.findByIdAndUpdate(s.id, { totalAmount: s.totalAmount }))
//         );


//         // Update enquiry with totals and quotation status
//         await Enquiry.findByIdAndUpdate(enquiry._id, {
//             quotationStatus: quotation.quotationStatus,
//             "enquiryStatusDates.quotationSentOn": quotation.date || new Date(),
//             subtotalAmount: calculations?.subtotal || 0,
//             discount: calculations?.discountAmount || 0,
//             grandTotal: calculations?.totalAmount || 0,
//         });

//         // Return response
//         return res.status(201).json(
//             new ApiResponse(201, quotation, 'Quotation created successfully')
//         );


//     } catch (error) {
//         console.error("Error creating quotation:", error);
//         throw new ApiError(500, 'Failed to create quotation', [error.message]);
//     }
// });


// const createQuotationByEnquiryId = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             date,
//             quotationNumber,
//             customer,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//         } = req.body;

//         if (!assignedEmployee) throw new ApiError(400, 'Assigned employee is required');

//         // Fetch enquiry
//         const enquiry = await Enquiry.findById(id)
//             .populate('services')
//             .populate('additionalServices')
//             .populate('customer');
//         if (!enquiry) throw new ApiError(404, 'Enquiry not found');
//         if (!enquiry.customer || !enquiry.customer._id)
//             throw new ApiError(400, 'Customer info missing in enquiry');

//         // Service snapshots
//         const serviceSnapshots = items.services.map(s => ({
//             id: s.id,
//             machineType: s.machineType,
//             equipmentNo: s.equipmentNo,
//             machineModel: s.machineModel,
//             serialNumber: s.serialNumber,
//             remark: s.remark,
//             totalAmount: s.totalAmount,
//         }));

//         const additionalServiceSnapshots = items.additionalServices.map(s => ({
//             id: s.id,
//             name: s.name,
//             description: s.description,
//             totalAmount: s.totalAmount,
//         }));

//         // 🧮 GST Calculations
//         const subtotal = Number(calculations?.subtotal || 0);
//         const discount = Number(calculations?.discountAmount || 0);
//         const gstRate = 18;
//         const gstAmount = ((subtotal - discount) * gstRate) / 100;
//         const total = subtotal - discount + gstAmount;

//         // 🧾 Create quotation
//         // const quotation = await Quotation.create({
//         //     date,
//         //     quotationId: quotationNumber,
//         //     enquiry: enquiry._id,
//         //     // from: enquiry.customer._id,
//         //     from: enquiry.hospital._id,

//         //     customer,
//         //     assignedEmployee,
//         //     items: {
//         //         services: serviceSnapshots,
//         //         additionalServices: additionalServiceSnapshots,
//         //     },
//         //     subtotal,
//         //     discount,
//         //     gstRate,
//         //     gstAmount,
//         //     total,
//         //     bankDetails,
//         //     companyDetails,
//         //     quotationStatus: 'Created',
//         //     termsAndConditions,
//         // });
//         const quotation = await Quotation.create({
//             date,
//             quotationId: quotationNumber,
//             enquiry: enquiry._id,
//             from: enquiry.hospital._id,
//             customer,
//             assignedEmployee: assignedEmployee.id || assignedEmployee, // only the ObjectId
//             items: {
//                 services: serviceSnapshots,
//                 additionalServices: additionalServiceSnapshots,
//             },
//             subtotal,
//             discount,
//             gstRate,
//             gstAmount,
//             total,
//             bankDetails,
//             companyDetails,
//             quotationStatus: 'Created',
//             termsAndConditions,
//         });


//         console.log("🚀 ~ quotation:", quotation)

//         // Update totals in DB
//         await Promise.all(serviceSnapshots
//             .filter(s => mongoose.Types.ObjectId.isValid(s.id))
//             .map(s => Services.findByIdAndUpdate(
//                 s.id,
//                 { $set: { totalAmount: s.totalAmount } },
//                 { new: true }
//             ))
//         );

//         await Promise.all(additionalServiceSnapshots
//             .filter(s => s.id)
//             .map(s => AdditionalService.findByIdAndUpdate(s.id, { totalAmount: s.totalAmount }))
//         );

//         // 🧩 Update enquiry with totals and GST details
//         await Enquiry.findByIdAndUpdate(enquiry._id, {
//             quotationStatus: quotation.quotationStatus,
//             "enquiryStatusDates.quotationSentOn": quotation.date || new Date(),
//             subtotalAmount: subtotal,
//             discount: discount,
//             grandTotal: total,
//         });

//         return res.status(201).json(
//             new ApiResponse(201, quotation, 'Quotation created successfully')
//         );

//     } catch (error) {
//         console.error("Error creating quotation:", error);
//         throw new ApiError(500, 'Failed to create quotation', [error.message]);
//     }
// });

// const createQuotationByEnquiryId = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         const {
//             date,
//             customer,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//         } = req.body;

//         if (!assignedEmployee) throw new ApiError(400, 'Assigned employee is required');

//         // Fetch enquiry
//         const enquiry = await Enquiry.findById(id)
//             .populate('services')
//             .populate('additionalServices')
//             .populate('customer');
//         if (!enquiry) throw new ApiError(404, 'Enquiry not found');
//         if (!enquiry.customer || !enquiry.customer._id)
//             throw new ApiError(400, 'Customer info missing in enquiry');

//         // Service snapshots
//         const serviceSnapshots = items.services.map(s => ({
//             id: s.id,
//             machineType: s.machineType,
//             equipmentNo: s.equipmentNo,
//             machineModel: s.machineModel,
//             serialNumber: s.serialNumber,
//             remark: s.remark,
//             totalAmount: s.totalAmount,
//         }));

//         const additionalServiceSnapshots = items.additionalServices.map(s => ({
//             id: s.id,
//             name: s.name,
//             description: s.description,
//             totalAmount: s.totalAmount,
//         }));

//         // 🧮 GST Calculations
//         const subtotal = Number(calculations?.subtotal || 0);
//         const discount = Number(calculations?.discountAmount || 0);
//         const gstRate = 18;
//         const gstAmount = ((subtotal - discount) * gstRate) / 100;
//         const total = subtotal - discount + gstAmount;

//         // 🔢 Generate quotation number sequentially
//         let lastQuotation = await Quotation.findOne({})
//             .sort({ createdAt: -1 })
//             .select("quotationId")
//             .lean();

//         let lastNumber = 0;

//         if (lastQuotation && lastQuotation.quotationId) {
//             // Extract the last sequence number from the previous quotationId
//             // Assuming format: QU + 4-digit random + 2-digit sequence
//             const seqPart = lastQuotation.quotationId.slice(-2);
//             lastNumber = parseInt(seqPart, 10);
//         }

//         // Increment sequence
//         const nextSequence = lastNumber + 1;

//         // Pad sequence to 2 digits
//         const paddedSequence = nextSequence.toString().padStart(2, "0");

//         // Generate random 4-digit part
//         const randomPart = Math.floor(1000 + Math.random() * 9000);

//         // Final quotation number
//         const quotationNumber = `QU${randomPart}${paddedSequence}`;

//         // 🧾 Create quotation
//         const quotation = await Quotation.create({
//             date,
//             quotationId: quotationNumber,
//             enquiry: enquiry._id,
//             from: enquiry.hospital._id,
//             customer,
//             assignedEmployee: assignedEmployee.id || assignedEmployee,
//             items: {
//                 services: serviceSnapshots,
//                 additionalServices: additionalServiceSnapshots,
//             },
//             subtotal,
//             discount,
//             gstRate,
//             gstAmount,
//             total,
//             bankDetails,
//             companyDetails,
//             quotationStatus: 'Created',
//             termsAndConditions,
//         });

//         console.log("🚀 ~ quotation:", quotation)

//         // Update totals in DB
//         await Promise.all(serviceSnapshots
//             .filter(s => mongoose.Types.ObjectId.isValid(s.id))
//             .map(s => Services.findByIdAndUpdate(
//                 s.id,
//                 { $set: { totalAmount: s.totalAmount } },
//                 { new: true }
//             ))
//         );

//         await Promise.all(additionalServiceSnapshots
//             .filter(s => s.id)
//             .map(s => AdditionalService.findByIdAndUpdate(s.id, { totalAmount: s.totalAmount }))
//         );

//         // 🧩 Update enquiry with totals and GST details
//         await Enquiry.findByIdAndUpdate(enquiry._id, {
//             quotationStatus: quotation.quotationStatus,
//             "enquiryStatusDates.quotationSentOn": quotation.date || new Date(),
//             subtotalAmount: subtotal,
//             discount: discount,
//             grandTotal: total,
//         });

//         return res.status(201).json(
//             new ApiResponse(201, quotation, 'Quotation created successfully')
//         );

//     } catch (error) {
//         console.error("Error creating quotation:", error);
//         throw new ApiError(500, 'Failed to create quotation', [error.message]);
//     }
// });




const createQuotationByEnquiryId = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const {
            date,
            customer,
            assignedEmployee,
            items,
            calculations,
            termsAndConditions,
            bankDetails,
            companyDetails,
            quotationNumber: frontendQuotationNumber, // Optional: Use if you want to honor frontend
        } = req.body;
        console.log("🚀 ~ req.body:", req.body)

        if (!assignedEmployee) throw new ApiError(400, 'Assigned employee is required');

        // Fetch enquiry
        const enquiry = await Enquiry.findById(id)
            .populate('services')
            .populate('additionalServices')
            .populate('customer')
            .populate('hospital'); // ✅ Add if enquiry.hospital is a ref
        if (!enquiry) throw new ApiError(404, 'Enquiry not found');
        if (!enquiry.customer || !enquiry.customer._id)
            throw new ApiError(400, 'Customer info missing in enquiry');

        // Service snapshots
        const serviceSnapshots = items.services.map(s => ({
            id: s.id,
            machineType: s.machineType,
            equipmentNo: s.equipmentNo,
            machineModel: s.machineModel,
            serialNumber: s.serialNumber,
            remark: s.remark,
            totalAmount: s.totalAmount,
        }));

        const additionalServiceSnapshots = items.additionalServices.map(s => ({
            id: s.id,
            name: s.name,
            description: s.description,
            totalAmount: s.totalAmount,
        }));

        // 🧮 GST Calculations
        const subtotal = Number(calculations?.subtotal || 0);
        const discountPercentage = Number(calculations?.discount || 0); // ✅ % from frontend
        const discountAmount = Number(calculations?.discountAmount || 0); // Amount for computation
        const gstRate = 18;
        const gstAmount = ((subtotal - discountAmount) * gstRate) / 100;
        const total = subtotal - discountAmount + gstAmount;

        // 🔢 Generate quotation number sequentially
        let lastQuotation = await Quotation.findOne({})
            .sort({ createdAt: -1 })
            .select("quotationId")
            .lean();

        let lastNumber = 0;

        if (lastQuotation && lastQuotation.quotationId) {
            const seqPart = lastQuotation.quotationId.slice(-2);
            lastNumber = parseInt(seqPart, 10);
        }

        const nextSequence = lastNumber + 1;
        const paddedSequence = nextSequence.toString().padStart(2, "0");
        const randomPart = Math.floor(1000 + Math.random() * 9000);
        const quotationNumber = `QU${randomPart}${paddedSequence}`;

        // 🧾 Create quotation (use discountPercentage for storage)
        const quotation = await Quotation.create({
            date,
            quotationId: quotationNumber, // Or use frontendQuotationNumber if preferred
            enquiry: enquiry._id,
            from: enquiry.hospital?._id || null, // ✅ Safe access
            customer,
            assignedEmployee: assignedEmployee.id || assignedEmployee,
            items: {
                services: serviceSnapshots,
                additionalServices: additionalServiceSnapshots,
            },
            subtotal,
            discount: discountPercentage, // ✅ Store % here
            discountAmount, // ✅ Optional: Add if schema supports separate field
            gstRate,
            gstAmount,
            total,
            bankDetails,
            companyDetails,
            quotationStatus: 'Created',
            termsAndConditions,
        });

        console.log("🚀 ~ quotation:", quotation);

        // Update totals in DB (with validation for both)
        // await Promise.all(
        //     serviceSnapshots
        //         .filter(s => mongoose.Types.ObjectId.isValid(s.id))
        //         .map(s => Services.findByIdAndUpdate(
        //             s.id,
        //             { $set: { totalAmount: s.totalAmount } },
        //             { new: true }
        //         ))
        // );

        // await Promise.all(
        //     additionalServiceSnapshots
        //         .filter(s => mongoose.Types.ObjectId.isValid(s.id)) // ✅ Add validation
        //         .map(s => AdditionalService.findByIdAndUpdate(
        //             s.id,
        //             { totalAmount: s.totalAmount }, // No $set needed for single field
        //             { new: true } // ✅ Consistent
        //         ))
        // );
        await Promise.all(
            serviceSnapshots
                .filter(s => mongoose.Types.ObjectId.isValid(s.id))
                .map(s => Services.findByIdAndUpdate(
                    s.id,
                    { $set: { totalAmount: s.totalAmount } },
                    { new: true }
                ))
        );

        await Promise.all(
            additionalServiceSnapshots
                .filter(s => mongoose.Types.ObjectId.isValid(s.id))
                .map(s => AdditionalService.findByIdAndUpdate(
                    s.id,
                    {
                        totalAmount: s.totalAmount,
                        description: s.description, // ✅ Added: Save edited description
                        // name: s.name, // Optional: If you make 'title' (name) editable too
                    },
                    { new: true }
                ))
        );

        // 🧩 Update enquiry with totals and GST details (store % in discount)
        await Enquiry.findByIdAndUpdate(enquiry._id, {
            quotationStatus: quotation.quotationStatus,
            // "enquiryStatusDates.quotationSentOn": quotation.date || new Date(),
            subtotalAmount: subtotal,
            discount: discountPercentage, // ✅ Store %
            grandTotal: total,
        });
        console.log("🚀 ~ Enquiry:----->", Enquiry)

        console.log("🚀 ~ quotation:------->", quotation)
        return res.status(201).json(
            new ApiResponse(201, quotation, 'Quotation created successfully')
        );

    } catch (error) {
        console.error("Error creating quotation:", error);
        throw new ApiError(500, 'Failed to create quotation', [error.message]);
    }
});




// const updateQuotationById = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params; // This is the enquiry ID

//         console.log("🚀 ~ inside updateQuotationByEnquiryId:");
//         const {
//             date,
//             quotationNumber,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//             quotationStatus,
//             rejectionRemark,
//         } = req.body;
//         console.log("🚀 ~ req.body:", req.body);

//         if (!assignedEmployee) throw new ApiError(400, "Assigned employee is required");

//         // Find the quotation by enquiry ID
//         const quotation = await Quotation.findOne({ enquiry: id })
//             .populate("enquiry")
//             .populate("from"); // hospital

//         if (!quotation) throw new ApiError(404, "Quotation not found for this enquiry");
//         if (!quotation.enquiry) throw new ApiError(400, "Enquiry info missing in quotation");
//         if (!quotation.from) throw new ApiError(400, "Hospital info missing in quotation");

//         // Prepare snapshots if items provided
//         let serviceSnapshots = quotation.items.services || [];
//         let additionalServiceSnapshots = quotation.items.additionalServices || [];

//         if (items) {
//             serviceSnapshots = items.services.map((s) => ({
//                 id: s.id,
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber,
//                 remark: s.remark,
//                 totalAmount: s.totalAmount,
//             }));

//             additionalServiceSnapshots = items.additionalServices.map((s) => ({
//                 id: s.id,
//                 name: s.name,
//                 description: s.description,
//                 totalAmount: s.totalAmount,
//             }));
//         }

//         // Update quotation
//         const updatedQuotation = await Quotation.findByIdAndUpdate(
//             quotation._id, // use quotation._id here
//             {
//                 date: date || quotation.date,
//                 quotationId: quotationNumber || quotation.quotationId,
//                 assignedEmployee: assignedEmployee || quotation.assignedEmployee,
//                 items: {
//                     services: serviceSnapshots,
//                     additionalServices: additionalServiceSnapshots,
//                 },
//                 calculations: calculations || quotation.calculations,
//                 bankDetails: bankDetails || quotation.bankDetails,
//                 companyDetails: companyDetails || quotation.companyDetails,
//                 discount: calculations?.discountAmount || quotation.discount,
//                 total: calculations?.totalAmount || quotation.total,
//                 quotationStatus: quotationStatus || quotation.quotationStatus,
//                 rejectionRemark: rejectionRemark || quotation.rejectionRemark,
//                 termsAndConditions: termsAndConditions || quotation.termsAndConditions,
//             },
//             { new: true, runValidators: true }
//         ).populate("enquiry").populate("from");

//         // Update service totals if items changed
//         if (items) {
//             await Promise.all(
//                 serviceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         Services.findByIdAndUpdate(
//                             s.id,
//                             { $set: { totalAmount: s.totalAmount } },
//                             { new: true }
//                         )
//                     )
//             );

//             await Promise.all(
//                 additionalServiceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         AdditionalService.findByIdAndUpdate(
//                             s.id,
//                             { $set: { totalAmount: s.totalAmount } },
//                             { new: true }
//                         )
//                     )
//             );
//         }

//         // Update enquiry with new calculations if changed
//         await Enquiry.findByIdAndUpdate(quotation.enquiry._id, {
//             quotationStatus: updatedQuotation.quotationStatus,
//             subtotalAmount: calculations?.subtotal || quotation.enquiry.subtotalAmount,
//             discount: calculations?.discountAmount || quotation.enquiry.discount,
//             grandTotal: calculations?.totalAmount || quotation.enquiry.grandTotal,
//         });

//         return res
//             .status(200)
//             .json(new ApiResponse(200, updatedQuotation, "Quotation updated successfully"));
//     } catch (error) {
//         console.error("Error updating quotation:", error);
//         throw new ApiError(500, "Failed to update quotation", [error.message]);
//     }
// });




//web






// const updateQuotationById = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params; // This is the enquiry ID
//         const {
//             date,
//             quotationNumber,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//             quotationStatus,
//             rejectionRemark,
//         } = req.body;

//         if (!assignedEmployee) throw new ApiError(400, "Assigned employee is required");

//         // Find the quotation by enquiry ID
//         const quotation = await Quotation.findOne({ enquiry: id })
//             .populate("enquiry")
//             .populate("from"); // hospital

//         if (!quotation) throw new ApiError(404, "Quotation not found for this enquiry");
//         if (!quotation.enquiry) throw new ApiError(400, "Enquiry info missing in quotation");
//         if (!quotation.from) throw new ApiError(400, "Hospital info missing in quotation");

//         // Prepare snapshots if items provided
//         let serviceSnapshots = quotation.items?.services || [];
//         let additionalServiceSnapshots = quotation.items?.additionalServices || [];

//         if (items) {
//             serviceSnapshots = (items.services || []).map((s) => ({
//                 id: s.id,
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber,
//                 remark: s.remark,
//                 totalAmount: Number(s.totalAmount) || 0,
//             }));

//             additionalServiceSnapshots = (items.additionalServices || []).map((s) => ({
//                 id: s.id,
//                 name: s.name,
//                 description: s.description,
//                 totalAmount: Number(s.totalAmount) || 0,
//             }));
//         }

//         // Update quotation
//         const updatedQuotation = await Quotation.findByIdAndUpdate(
//             quotation._id,
//             {
//                 date: date || quotation.date,
//                 quotationId: quotationNumber || quotation.quotationId,
//                 // assignedEmployee: assignedEmployee || quotation.assignedEmployee,
//                 items: {
//                     services: serviceSnapshots,
//                     additionalServices: additionalServiceSnapshots,
//                 },
//                 calculations: calculations || quotation.calculations,
//                 bankDetails: bankDetails || quotation.bankDetails,
//                 companyDetails: companyDetails || quotation.companyDetails,
//                 discount: calculations?.discountAmount || quotation.discount,
//                 total: calculations?.totalAmount || quotation.total,
//                 quotationStatus: quotationStatus || quotation.quotationStatus,
//                 rejectionRemark: rejectionRemark || quotation.rejectionRemark,
//                 termsAndConditions: termsAndConditions || quotation.termsAndConditions,
//             },
//             { new: true, runValidators: true }
//         ).populate("enquiry").populate("from");

//         // Update service totals if items changed
//         if (items) {
//             await Promise.all(
//                 serviceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) => Services.findByIdAndUpdate(
//                         s.id,
//                         { $set: { totalAmount: s.totalAmount } },
//                         { new: true }
//                     ))
//             );

//             await Promise.all(
//                 additionalServiceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) => AdditionalService.findByIdAndUpdate(
//                         s.id,
//                         { $set: { totalAmount: s.totalAmount } },
//                         { new: true }
//                     ))
//             );
//         }

//         // Update enquiry with new calculations if changed
//         await Enquiry.findByIdAndUpdate(quotation.enquiry._id, {
//             quotationStatus: updatedQuotation.quotationStatus,
//             subtotalAmount: calculations?.subtotal || quotation.enquiry.subtotalAmount,
//             discount: calculations?.discountAmount || quotation.enquiry.discount,
//             grandTotal: calculations?.totalAmount || quotation.enquiry.grandTotal,
//         });

//         return res.status(200).json(new ApiResponse(200, updatedQuotation, "Quotation updated successfully"));
//     } catch (error) {
//         console.error("Error updating quotation:", error);
//         throw new ApiError(500, "Failed to update quotation", [error.message]);
//     }
// });




// const updateQuotationById = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params; // enquiry ID
//         const {
//             date,
//             quotationNumber,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//             quotationStatus,
//             rejectionRemark,
//         } = req.body;

//         if (!assignedEmployee) throw new ApiError(400, "Assigned employee is required");

//         // Find the quotation linked to this enquiry
//         const quotation = await Quotation.findOne({ enquiry: id })
//             .populate("enquiry")
//             .populate("from");

//         if (!quotation) throw new ApiError(404, "Quotation not found for this enquiry");
//         if (!quotation.enquiry) throw new ApiError(400, "Enquiry info missing in quotation");
//         if (!quotation.from) throw new ApiError(400, "Hospital info missing in quotation");

//         // Prepare updated snapshots if items provided
//         let serviceSnapshots = quotation.items?.services || [];
//         let additionalServiceSnapshots = quotation.items?.additionalServices || [];

//         if (items) {
//             serviceSnapshots = (items.services || []).map((s) => ({
//                 id: s.id,
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber,
//                 remark: s.remark,
//                 totalAmount: Number(s.totalAmount) || 0,
//             }));

//             additionalServiceSnapshots = (items.additionalServices || []).map((s) => ({
//                 id: s.id,
//                 name: s.name,
//                 description: s.description,
//                 totalAmount: Number(s.totalAmount) || 0,
//             }));
//         }

//         // Update quotation data
//         const updatedQuotation = await Quotation.findByIdAndUpdate(
//             quotation._id,
//             {
//                 date: date || quotation.date,
//                 quotationId: quotationNumber || quotation.quotationId,
//                 items: {
//                     services: serviceSnapshots,
//                     additionalServices: additionalServiceSnapshots,
//                 },
//                 calculations: calculations || quotation.calculations,
//                 bankDetails: bankDetails || quotation.bankDetails,
//                 companyDetails: companyDetails || quotation.companyDetails,
//                 discount: calculations?.discountAmount || quotation.discount,
//                 total: calculations?.totalAmount || quotation.total,
//                 quotationStatus: quotationStatus || quotation.quotationStatus,
//                 rejectionRemark: rejectionRemark || quotation.rejectionRemark,
//                 termsAndConditions: termsAndConditions || quotation.termsAndConditions,
//             },
//             { new: true, runValidators: true }
//         ).populate("enquiry").populate("from");

//         // Update related services (if amounts changed)
//         if (items) {
//             await Promise.all(
//                 serviceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         Services.findByIdAndUpdate(
//                             s.id,
//                             { $set: { totalAmount: s.totalAmount } },
//                             { new: true }
//                         )
//                     )
//             );

//             await Promise.all(
//                 additionalServiceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         AdditionalService.findByIdAndUpdate(
//                             s.id,
//                             { $set: { totalAmount: s.totalAmount } },
//                             { new: true }
//                         )
//                     )
//             );
//         }

//         // ✅ Update Enquiry status as "Quotation Sent"
//         const newEnquiryStatus =
//             quotationStatus === "Accepted"
//                 ? "Approved"
//                 : quotationStatus === "Rejected"
//                     ? "Rejected"
//                     : "Quotation Sent";

//         await Enquiry.findByIdAndUpdate(quotation.enquiry._id, {
//             enquiryStatus: newEnquiryStatus,
//             "enquiryStatusDates.quotationSentOn":
//                 newEnquiryStatus === "Quotation Sent" ? new Date() : undefined,
//             quotationStatus: updatedQuotation.quotationStatus,
//             subtotalAmount: calculations?.subtotal || quotation.enquiry.subtotalAmount,
//             discount: calculations?.discountAmount || quotation.enquiry.discount,
//             grandTotal: calculations?.totalAmount || quotation.enquiry.grandTotal,
//         });

//         return res
//             .status(200)
//             .json(new ApiResponse(200, updatedQuotation, "Quotation updated successfully"));
//     } catch (error) {
//         console.error("Error updating quotation:", error);
//         throw new ApiError(500, "Failed to update quotation", [error.message]);
//     }
// });


// const updateQuotationById = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params; // enquiry ID
//         const {
//             date,
//             quotationNumber,
//             assignedEmployee,
//             items,
//             calculations,
//             termsAndConditions,
//             bankDetails,
//             companyDetails,
//             rejectionRemark,
//         } = req.body;

//         if (!assignedEmployee) throw new ApiError(400, "Assigned employee is required");

//         // Find the quotation linked to this enquiry
//         const quotation = await Quotation.findOne({ enquiry: id })
//             .populate("enquiry")
//             .populate("from");

//         if (!quotation) throw new ApiError(404, "Quotation not found for this enquiry");
//         if (!quotation.enquiry) throw new ApiError(400, "Enquiry info missing in quotation");
//         if (!quotation.from) throw new ApiError(400, "Hospital info missing in quotation");

//         // Prepare updated snapshots if items provided
//         let serviceSnapshots = quotation.items?.services || [];
//         let additionalServiceSnapshots = quotation.items?.additionalServices || [];

//         // if (items) {
//         //     serviceSnapshots = (items.services || []).map((s) => ({
//         //         id: s.id,
//         //         machineType: s.machineType,
//         //         equipmentNo: s.equipmentNo,
//         //         machineModel: s.machineModel,
//         //         serialNumber: s.serialNumber,
//         //         remark: s.remark,
//         //         totalAmount: Number(s.totalAmount) || 0,
//         //     }));

//         //     additionalServiceSnapshots = (items.additionalServices || []).map((s) => ({
//         //         id: s.id,
//         //         name: s.name,
//         //         description: s.description,
//         //         totalAmount: Number(s.totalAmount) || 0,
//         //     }));
//         // }

//         // Update quotation data and force quotationStatus to "Created"

//         // Update related services (if amounts changed)
//         if (items) {
//             await Promise.all(
//                 serviceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         Services.findByIdAndUpdate(
//                             s.id,
//                             { $set: { totalAmount: s.totalAmount } },
//                             { new: true }
//                         )
//                     )
//             );

//             await Promise.all(
//                 additionalServiceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         AdditionalService.findByIdAndUpdate(
//                             s.id,
//                             {
//                                 $set: {
//                                     totalAmount: s.totalAmount,
//                                     name: s.name, // ✅ Save edited name
//                                     description: s.description // ✅ Save edited description
//                                 }
//                             },
//                             { new: true }
//                         )
//                     )
//             );
//         }
//         const updatedQuotation = await Quotation.findByIdAndUpdate(
//             quotation._id,
//             {
//                 date: date || quotation.date,
//                 quotationId: quotationNumber || quotation.quotationId,
//                 items: {
//                     services: serviceSnapshots,
//                     additionalServices: additionalServiceSnapshots,
//                 },
//                 calculations: calculations || quotation.calculations,
//                 bankDetails: bankDetails || quotation.bankDetails,
//                 companyDetails: companyDetails || quotation.companyDetails,
//                 discount: calculations?.discountAmount || quotation.discount,
//                 total: calculations?.totalAmount || quotation.total,
//                 quotationStatus: "Created", // ✅ Force to "Created"
//                 rejectionRemark: rejectionRemark || quotation.rejectionRemark,
//                 termsAndConditions: termsAndConditions || quotation.termsAndConditions,
//             },
//             { new: true, runValidators: true }
//         ).populate("enquiry").populate("from");

//         // Update related services (if amounts changed)
//         if (items) {
//             await Promise.all(
//                 serviceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         Services.findByIdAndUpdate(
//                             s.id,
//                             { $set: { totalAmount: s.totalAmount } },
//                             { new: true }
//                         )
//                     )
//             );

//             await Promise.all(
//                 additionalServiceSnapshots
//                     .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
//                     .map((s) =>
//                         AdditionalService.findByIdAndUpdate(
//                             s.id,
//                             { $set: { totalAmount: s.totalAmount } },
//                             { new: true }
//                         )
//                     )
//             );
//         }

//         // Update Enquiry status as "Quotation Sent"
//         await Enquiry.findByIdAndUpdate(quotation.enquiry._id, {
//             enquiryStatus: "Quotation Sent",
//             "enquiryStatusDates.quotationSentOn": new Date(),
//             quotationStatus: updatedQuotation.quotationStatus,
//             subtotalAmount: calculations?.subtotal || quotation.enquiry.subtotalAmount,
//             discount: calculations?.discountAmount || quotation.enquiry.discount,
//             grandTotal: calculations?.totalAmount || quotation.enquiry.grandTotal,
//         });

//         return res
//             .status(200)
//             .json(new ApiResponse(200, updatedQuotation, "Quotation updated successfully"));
//     } catch (error) {
//         console.error("Error updating quotation:", error);
//         throw new ApiError(500, "Failed to update quotation", [error.message]);
//     }
// });
const updateQuotationById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params; // enquiry ID
        const {
            date,
            quotationNumber,
            assignedEmployee,
            items,
            calculations,
            termsAndConditions,
            bankDetails,
            companyDetails,
            rejectionRemark,
            discount, // percentage from body
        } = req.body;

        if (!assignedEmployee) throw new ApiError(400, "Assigned employee is required");

        // Find the quotation linked to this enquiry
        const quotation = await Quotation.findOne({ enquiry: id })
            .populate("enquiry")
            .populate("from");

        if (!quotation) throw new ApiError(404, "Quotation not found for this enquiry");
        if (!quotation.enquiry) throw new ApiError(400, "Enquiry info missing in quotation");
        if (!quotation.from) throw new ApiError(400, "Hospital info missing in quotation");

        // Prepare updated snapshots if items provided
        let serviceSnapshots = quotation.items?.services || [];
        let additionalServiceSnapshots = quotation.items?.additionalServices || [];

        if (items) {
            serviceSnapshots = (items.services || []).map((s) => ({
                id: s.id,
                machineType: s.machineType,
                equipmentNo: s.equipmentNo,
                machineModel: s.machineModel,
                serialNumber: s.serialNumber,
                remark: s.remark,
                totalAmount: Number(s.totalAmount) || 0,
            }));

            additionalServiceSnapshots = (items.additionalServices || []).map((s) => ({
                id: s.id,
                name: s.name,
                description: s.description,
                totalAmount: Number(s.totalAmount) || 0,
            }));
        }

        // Update related services (if amounts changed)
        if (items) {
            await Promise.all(
                serviceSnapshots
                    .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
                    .map((s) =>
                        Services.findByIdAndUpdate(
                            s.id,
                            { $set: { totalAmount: s.totalAmount } },
                            { new: true }
                        )
                    )
            );

            await Promise.all(
                additionalServiceSnapshots
                    .filter((s) => mongoose.Types.ObjectId.isValid(s.id))
                    .map((s) =>
                        AdditionalService.findByIdAndUpdate(
                            s.id,
                            {
                                $set: {
                                    totalAmount: s.totalAmount,
                                    name: s.name, // ✅ Save edited name
                                    description: s.description // ✅ Save edited description
                                }
                            },
                            { new: true }
                        )
                    )
            );
        }

        // Update quotation data and force quotationStatus to "Created"
        const updatedQuotation = await Quotation.findByIdAndUpdate(
            quotation._id,
            {
                date: date || quotation.date,
                quotationId: quotationNumber || quotation.quotationId,
                items: {
                    services: serviceSnapshots,
                    additionalServices: additionalServiceSnapshots,
                },
                calculations: calculations || quotation.calculations,
                bankDetails: bankDetails || quotation.bankDetails,
                companyDetails: companyDetails || quotation.companyDetails,
                discount: discount || quotation.discount, // ✅ Use percentage from body
                total: calculations?.totalAmount || quotation.total,
                quotationStatus: "Created", // ✅ Force to "Created"
                rejectionRemark: rejectionRemark || quotation.rejectionRemark,
                termsAndConditions: termsAndConditions || quotation.termsAndConditions,
            },
            { new: true, runValidators: true }
        ).populate("enquiry").populate("from");

        // Update Enquiry status as "Quotation Sent"
        await Enquiry.findByIdAndUpdate(quotation.enquiry._id, {
            enquiryStatus: "Quotation Sent",
            "enquiryStatusDates.quotationSentOn": new Date(),
            quotationStatus: updatedQuotation.quotationStatus,
            subtotalAmount: calculations?.subtotal || quotation.enquiry.subtotalAmount,
            discount: discount || quotation.enquiry.discount, // ✅ Use percentage from body
            grandTotal: calculations?.totalAmount || quotation.enquiry.grandTotal,
        });

        return res
            .status(200)
            .json(new ApiResponse(200, updatedQuotation, "Quotation updated successfully"));
    } catch (error) {
        console.error("Error updating quotation:", error);
        throw new ApiError(500, "Failed to update quotation", [error.message]);
    }
});



// const getQuotationByEnquiryId = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.params;
//         console.log("🚀 ~ id:", id)

//         if (!id) {
//             throw new ApiError(400, 'Enquiry ID is required');
//         }

//         // Find the quotation associated with the given enquiry ID
//         const quotation = await Quotation.findOne({ enquiry: id })
//             .populate({
//                 path: 'enquiry',
//                 populate: [
//                     {
//                         path: 'services', // populate services inside enquiry
//                         model: 'Service',
//                     },
//                     {
//                         path: 'additionalServices', // populate additionalServices inside enquiry
//                         model: 'AdditionalService',
//                         select: 'name description totalAmount', // select only these fields
//                     },
//                 ],
//             })
//             .populate('from', 'name email') // employee info
//             .exec();
//         // console.log("🚀 ~ quotation:", quotation)

//         if (!quotation) {
//             throw new ApiError(404, 'Quotation not found for this enquiry');
//         }

//         return res
//             .status(200)
//             .json(new ApiResponse(200, quotation, 'Quotation fetched successfully'));
//     } catch (error) {
//         console.error("Error fetching quotation:", error);
//         throw new ApiError(500, 'Failed to fetch quotation', [error.message]);
//     }
// });




//mobile

const getQuotationByEnquiryId = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🚀 ~ id:", id);

        if (!id) {
            throw new ApiError(400, 'Enquiry ID is required');
        }

        // Find the quotation associated with the given enquiry ID
        // const quotation = await Quotation.findOne({ enquiry: id })
        //     .populate({
        //         path: 'enquiry',
        //         populate: [
        //             { path: 'services', model: 'Service' },
        //             { path: 'additionalServices', model: 'AdditionalService', select: 'name description totalAmount' },
        //         ],
        //     })
        //     .populate('from', 'name email') // hospital info
        //     .populate('assignedEmployee', 'name phone') // employee info
        //     .exec();
        const quotation = await Quotation.findOne({ enquiry: id })
            .populate({
                path: 'enquiry',
                populate: [
                    { path: 'services', model: 'Service' },
                    { path: 'additionalServices', model: 'AdditionalService', select: 'name description totalAmount' },
                ],
            })
            .populate('from', 'name email')
            .populate({
                path: 'assignedEmployee',
                select: 'name phone role', // Add fields you need
                // Explicitly allow Dealer & Manufacturer
                match: { role: { $in: ['Employee', 'Dealer', 'Manufacturer'] } }
            })
            .exec();
        console.log("🚀 ~ quotation:", quotation)

        console.log("🚀 ~ quotation:", quotation)

        if (!quotation) {
            throw new ApiError(404, 'Quotation not found for this enquiry');
        }

        return res
            .status(200)
            .json(new ApiResponse(200, quotation, 'Quotation fetched successfully'));
    } catch (error) {
        console.error("Error fetching quotation:", error);
        throw new ApiError(500, 'Failed to fetch quotation', [error.message]);
    }
});


const getQuotationByIds = asyncHandler(async (req, res) => {
    const { hospitalId, enquiryId } = req.params;

    if (!enquiryId || !hospitalId) {
        throw new ApiError(400, 'Enquiry ID and Hospital ID are required');
    }

    const quotation = await Quotation.findOne({
        enquiry: enquiryId,
        from: hospitalId   // 👈 use `from` since schema has this
    })
        .populate('enquiry')   // populate enquiry details
        .populate('from');     // populate hospital details

    if (!quotation) {
        throw new ApiError(404, 'Quotation not found for the given enquiry and hospital');
    }

    res.status(200).json(new ApiResponse(200, quotation, 'Quotation fetched successfully'));
});


// export const acceptQuotation = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, enquiryId, quotationId } = req.params;
//         let pdfFile = req.file; // optional PDF
//         console.log("🚀 ~ pdfFile:", pdfFile)

//         // 1️⃣ Find the quotation by enquiry + hospital
//         const quotation = await Quotation.findOne({
//             _id: quotationId,
//             enquiry: enquiryId,
//             from: hospitalId
//         });
//         if (!quotation) {
//             return res.status(404).json({ message: "Quotation not found for this hospital" });
//         }

//         // 2️⃣ Upload PDF if provided
//         if (pdfFile) {
//             const { url } = await uploadToS3(pdfFile);
//             quotation.customersPDF = url;
//             console.log("🚀 ~  quotation.customersPDF:", quotation.customersPDF)
//         }

//         // Update quotation status
//         quotation.quotationStatus = 'Accepted';
//         await quotation.save();

//         // 3️⃣ Find the related enquiry (with services)
//         const enquiry = await Enquiry.findOne({
//             _id: enquiryId,
//             hospital: hospitalId
//         }).populate("services");
//         if (!enquiry) {
//             return res.status(404).json({ message: "Enquiry not found for this hospital" });
//         }

//         // Update enquiry status
//         enquiry.enquiryStatus = 'Approved';
//         enquiry.quotationStatus = 'Accepted';
//         enquiry.enquiryStatusDates.approvedOn = new Date();
//         await enquiry.save();

//         // 4️⃣ Create new Service documents (clones)
//         const serviceDocs = await Promise.all(
//             enquiry.services.map(async (service) => {
//                 const newService = new Services({
//                     machineType: service.machineType,
//                     equipmentNo: service.equipmentNo,
//                     machineModel: service.machineModel,
//                     workTypeDetails: (service.workTypeDetails || []).map(wt => ({
//                         workType: wt.workType,
//                         serviceName: wt.serviceName,
//                         status: wt.status || "pending",
//                     })),
//                 });
//                 await newService.save();
//                 return newService._id;
//             })
//         );

//         // 5️⃣ Create Order with service IDs
//         const order = await orderModel.create({
//             leadOwner: enquiry.leadOwner,
//             hospital: hospitalId,
//             hospitalName: enquiry.hospitalName,
//             fullAddress: enquiry.fullAddress,
//             city: enquiry.city,
//             district: enquiry.district,
//             state: enquiry.state,
//             pinCode: enquiry.pinCode,
//             branchName: enquiry.branch,
//             contactPersonName: enquiry.contactPerson,
//             emailAddress: enquiry.emailAddress,
//             contactNumber: enquiry.contactNumber,
//             designation: enquiry.designation,
//             advanceAmount: 0,
//             workOrderCopy: '',
//             partyCodeOrSysId: '',
//             procNoOrPoNo: '',
//             urgency: 'normal',
//             specialInstructions: enquiry.specialInstructions,
//             additionalServices: enquiry.additionalServices,
//             services: serviceDocs,
//             quotation: quotation._id,
//             customer: enquiry.customer
//         });

//         res.status(200).json({
//             message: "Quotation accepted and order created successfully",
//             quotation,
//             order
//         });

//     } catch (error) {
//         console.error("Error in acceptQuotation:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });





// export const acceptQuotation = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, enquiryId, quotationId } = req.params;
//         let pdfFile = req.file;

//         const quotation = await Quotation.findOne({
//             _id: quotationId,
//             enquiry: enquiryId,
//             from: hospitalId,
//         });
//         if (!quotation)
//             return res.status(404).json({ message: "Quotation not found for this hospital" });

//         if (pdfFile) {
//             const { url } = await uploadToS3(pdfFile);
//             quotation.customersPDF = url;
//         }

//         quotation.quotationStatus = "Accepted";
//         await quotation.save();

//         // 🧩 Create quotation history record
//         await QuotationHistory.create({
//             quotation: quotation._id,
//             status: "Accepted",
//             pdfUrl: quotation.customersPDF || quotation.pdfUrl,
//             date: new Date(),
//         });

//         const enquiry = await Enquiry.findOne({
//             _id: enquiryId,
//             hospital: hospitalId,
//         }).populate("services");
//         if (!enquiry)
//             return res.status(404).json({ message: "Enquiry not found for this hospital" });

//         enquiry.enquiryStatus = "Approved";
//         enquiry.quotationStatus = "Accepted";
//         enquiry.enquiryStatusDates.approvedOn = new Date();
//         await enquiry.save();

//         const serviceDocs = await Promise.all(
//             enquiry.services.map(async (service) => {
//                 const newService = new Services({
//                     machineType: service.machineType,
//                     equipmentNo: service.equipmentNo,
//                     machineModel: service.machineModel,
//                     workTypeDetails: (service.workTypeDetails || []).map((wt) => ({
//                         workType: wt.workType,
//                         serviceName: wt.serviceName,
//                         status: wt.status || "pending",
//                     })),
//                 });
//                 await newService.save();
//                 return newService._id;
//             })
//         );

//         const order = await orderModel.create({
//             leadOwner: enquiry.leadOwner,
//             hospital: hospitalId,
//             hospitalName: enquiry.hospitalName,
//             fullAddress: enquiry.fullAddress,
//             city: enquiry.city,
//             district: enquiry.district,
//             state: enquiry.state,
//             pinCode: enquiry.pinCode,
//             branchName: enquiry.branch,
//             contactPersonName: enquiry.contactPerson,
//             emailAddress: enquiry.emailAddress,
//             contactNumber: enquiry.contactNumber,
//             designation: enquiry.designation,
//             advanceAmount: 0,
//             workOrderCopy: "",
//             partyCodeOrSysId: "",
//             procNoOrPoNo: "",
//             urgency: "normal",
//             specialInstructions: enquiry.specialInstructions,
//             additionalServices: enquiry.additionalServices,
//             services: serviceDocs,
//             quotation: quotation._id,
//             customer: enquiry.customer,
//         });
//         console.log("🚀 ~ order:", order)

//         res.status(200).json({
//             message: "Quotation accepted and order created successfully",
//             quotation,
//             order,
//         });
//     } catch (error) {
//         console.error("Error in acceptQuotation:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });

export const acceptQuotation = asyncHandler(async (req, res) => {
    try {
        const { hospitalId, enquiryId, quotationId } = req.params;
        let pdfFile = req.file;

        // 1) Load quotation + assignedEmployee (name only)
        const quotation = await Quotation.findOne({
            _id: quotationId,
            enquiry: enquiryId,
            from: hospitalId,
        })
            .populate({
                path: "assignedEmployee",
                select: "fullName name firstName lastName email employeeCode",
            });

        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found for this hospital" });
        }

        // 2) If customer uploaded a PDF, put it on S3
        if (pdfFile) {
            const { url } = await uploadToS3(pdfFile);
            quotation.customersPDF = url;
        }

        quotation.quotationStatus = "Accepted";
        await quotation.save();

        // 3) History
        await QuotationHistory.create({
            quotation: quotation._id,
            status: "Accepted",
            pdfUrl: quotation.customersPDF || quotation.pdfUrl,
            date: new Date(),
        });

        // 4) Get enquiry (and its services)
        const enquiry = await Enquiry.findOne({
            _id: enquiryId,
            hospital: hospitalId,
        }).populate("services");

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found for this hospital" });
        }

        enquiry.enquiryStatus = "Approved";
        enquiry.quotationStatus = "Accepted";
        enquiry.enquiryStatusDates.approvedOn = new Date();
        await enquiry.save();

        // 5) Clone enquiry.services → Order.services
        const serviceDocs = await Promise.all(
            (enquiry.services || []).map(async (service) => {
                const newService = new Services({
                    machineType: service.machineType,
                    equipmentNo: service.equipmentNo,
                    quantity: service.quantity,
                    machineModel: service.machineModel,
                    workTypeDetails: (service.workTypeDetails || []).map((wt) => ({
                        workType: wt.workType,
                        serviceName: wt.serviceName,
                        status: wt.status || "pending",
                    })),
                });
                await newService.save();
                return newService._id;
            })
        );

        // 6) Compute lead owner from quotation.assignedEmployee (fallback to enquiry.leadOwner)
        const emp = quotation.assignedEmployee;
        console.log("🚀 ~ emp:", emp)
        const employeeDisplayName =
            (emp && (emp.fullName || emp.name || [emp.firstName, emp.lastName].filter(Boolean).join(" "))) || null;

        const leadOwnerForOrder = employeeDisplayName || enquiry.leadOwner || "Unassigned";

        // 7) Create order with the correct leadOwner
        const order = await orderModel.create({
            leadOwner: emp._id, // <-- from assignedEmployee
            hospital: hospitalId,
            hospitalName: enquiry.hospitalName,
            fullAddress: enquiry.fullAddress,
            city: enquiry.city,
            district: enquiry.district,
            state: enquiry.state,
            pinCode: enquiry.pinCode,
            branchName: enquiry.branch,
            contactPersonName: enquiry.contactPerson,
            emailAddress: enquiry.emailAddress,
            contactNumber: enquiry.contactNumber,
            designation: enquiry.designation,
            advanceAmount: 0,
            workOrderCopy: "",
            partyCodeOrSysId: "",
            procNoOrPoNo: "",
            urgency: "normal",
            specialInstructions: enquiry.specialInstructions,
            additionalServices: enquiry.additionalServices,
            services: serviceDocs,
            quotation: quotation._id,
            customer: enquiry.customer,
        });

        res.status(200).json({
            message: "Quotation accepted and order created successfully",
            quotation,
            order,
        });
    } catch (error) {
        console.error("Error in acceptQuotation:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




// const rejectQuotation = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, enquiryId, quotationId } = req.params;
//         console.log("🚀 ~ quotationId:", quotationId)
//         console.log("🚀 ~ enquiryId:", enquiryId)
//         console.log("🚀 ~ hospitalId:", hospitalId)
//         const { rejectionRemark } = req.body;

//         console.log("Rejecting Quotation:", { quotationId, enquiryId, hospitalId, rejectionRemark });

//         // 1️⃣ Find the quotation and ensure it belongs to the hospital and enquiry
//         const quotation = await Quotation.findOne({
//             _id: quotationId,
//             enquiry: enquiryId,
//             from: hospitalId   // changed from "from: customerId"
//         });

//         if (!quotation) {
//             return res.status(404).json({
//                 message: "Quotation not found for the provided hospital and enquiry"
//             });
//         }

//         // 2️⃣ Prevent rejecting already accepted quotations
//         if (quotation.quotationStatus === "Accepted") {
//             return res.status(400).json({
//                 message: "Cannot reject a quotation that has already been accepted"
//             });
//         }

//         // 3️⃣ Reject the quotation
//         quotation.quotationStatus = "Rejected";
//         quotation.rejectionRemark = rejectionRemark;
//         await quotation.save();
//         // 4️⃣ Find and update the corresponding enquiry
//         const enquiry = await Enquiry.findOne({
//             _id: enquiryId,
//             hospital: hospitalId   // changed from "customer: customerId"
//         });
//         if (!enquiry) {
//             return res.status(404).json({
//                 message: "Related enquiry not found for the hospital"
//             });
//         }
//         enquiry.enquiryStatus = "Rejected";
//         enquiry.quotationStatus = "Rejected";
//         await enquiry.save();

//         res.status(200).json({
//             message: "Quotation rejected successfully",
//             quotation
//         });
//     } catch (error) {
//         console.error("Error in rejectQuotation:", error);
//         res.status(500).json({
//             message: "Server error",
//             error: error.message
//         });
//     }
// });


export const rejectQuotation = asyncHandler(async (req, res) => {
    try {
        const { hospitalId, enquiryId, quotationId } = req.params;
        const { rejectionRemark } = req.body;

        const quotation = await Quotation.findOne({
            _id: quotationId,
            enquiry: enquiryId,
            from: hospitalId,
        });

        if (!quotation)
            return res.status(404).json({ message: "Quotation not found for this hospital" });

        if (quotation.quotationStatus === "Accepted") {
            return res.status(400).json({
                message: "Cannot reject a quotation that has already been accepted",
            });
        }

        quotation.quotationStatus = "Rejected";
        quotation.rejectionRemark = rejectionRemark;
        await quotation.save();

        // 🧩 Create quotation history record
        await QuotationHistory.create({
            quotation: quotation._id,
            status: "Rejected",
            pdfUrl: quotation.customersPDF || quotation.pdfUrl,
            remark: rejectionRemark,
            date: new Date(),
        });

        const enquiry = await Enquiry.findOne({
            _id: enquiryId,
            hospital: hospitalId,
        });
        if (!enquiry)
            return res.status(404).json({ message: "Related enquiry not found for the hospital" });

        enquiry.enquiryStatus = "Rejected";
        enquiry.quotationStatus = "Rejected";
        await enquiry.save();

        res.status(200).json({
            message: "Quotation rejected successfully",
            quotation,
        });
    } catch (error) {
        console.error("Error in rejectQuotation:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

const acceptQuotationPDF = asyncHandler(async (req, res) => {
    try {
        const { quotationId } = req.params; // quotationId from URL
        const file = req.file; // uploaded pdf (make sure multer middleware is used)

        if (!file) {
            return res.status(400).json({ message: "No PDF file uploaded" });
        }

        // Upload file to AWS S3
        const { url, key } = await uploadToS3(file, "quotations"); // return { url, key }
        // Update quotation record
        const updatedQuotation = await Quotation.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(quotationId) },
            {
                customersPDF: url,
                quotationStatus: "Accepted",
            },
            { new: true }
        );

        if (!updatedQuotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        res.status(200).json({
            message: "Quotation accepted and PDF uploaded successfully",
            quotation: updatedQuotation,
        });
    } catch (error) {
        console.error("Error in acceptQuotationPDF:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// const downloadQuotationPdf = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, quotationId } = req.params;
//         console.log("🚀 ~ quotationId:", quotationId)
//         console.log("🚀 ~ hospitalId:", hospitalId)

//         if (!quotationId || !hospitalId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "quotationId and hospitalId are required",
//             });
//         }

//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "PDF file is required",
//             });
//         }

//         // 1️⃣ Upload file to S3
//         const { url } = await uploadToS3(req.file);

//         // 2️⃣ Save URL in MongoDB
//         const quotation = await Quotation.findByIdAndUpdate(
//             quotationId,
//             {
//                 $set: {
//                     pdfUrl: url,
//                     from: hospitalId, // ensures hospital is linked
//                 },
//             },
//             { new: true }
//         );
//         console.log("🚀 ~ quotation:", quotation)

//         if (!quotation) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Quotation not found",
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             message: "Quotation PDF uploaded successfully",
//             pdfUrl: url,
//             quotation,
//             isUploaded: true,
//         });
//     } catch (error) {
//         console.error("Error uploading quotation PDF:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Server error",
//         });
//     }
// });


// const downloadQuotationPdf = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId, quotationId } = req.params;
//         console.log("🚀 ~ quotationId:", quotationId);
//         console.log("🚀 ~ hospitalId:", hospitalId);

//         if (!quotationId || !hospitalId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "quotationId and hospitalId are required",
//             });
//         }

//         if (!req.file) {
//             return res.status(400).json({
//                 success: false,
//                 message: "PDF file is required",
//             });
//         }

//         // 1️⃣ Upload file to S3
//         const { url } = await uploadToS3(req.file);

//         // 2️⃣ Save URL in MongoDB (Quotation)
//         const quotation = await Quotation.findByIdAndUpdate(
//             quotationId,
//             {
//                 $set: {
//                     pdfUrl: url,
//                     from: hospitalId,
//                     quotationStatus: "Created", // ✅ mark as created when PDF is uploaded
//                 },
//             },
//             { new: true }
//         );

//         if (!quotation) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Quotation not found",
//             });
//         }

//         // 3️⃣ Update Enquiry with quotation sent date & status
//         await Enquiry.findByIdAndUpdate(
//             quotation.enquiry,
//             {
//                 $set: {
//                     "enquiryStatus": "Quotation Sent",
//                     "quotationStatus": "Created",
//                     "enquiryStatusDates.quotationSentOn": new Date(),
//                 },
//             },
//             { new: true }
//         );

//         return res.status(200).json({
//             success: true,
//             message: "Quotation PDF uploaded and quotation sent date updated successfully",
//             pdfUrl: url,
//             quotation,
//             isUploaded: true,
//         });
//     } catch (error) {
//         console.error("Error uploading quotation PDF:", error);
//         res.status(500).json({
//             success: false,
//             message: error.message || "Server error",
//         });
//     }
// });

const downloadQuotationPdf = asyncHandler(async (req, res) => {
    try {
        const { hospitalId, quotationId } = req.params;
        console.log("🚀 ~ quotationId:", quotationId);
        console.log("🚀 ~ hospitalId:", hospitalId);

        if (!quotationId || !hospitalId) {
            return res.status(400).json({
                success: false,
                message: "quotationId and hospitalId are required",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF file is required",
            });
        }

        // 1️⃣ Upload file to S3
        const { url } = await uploadToS3(req.file);

        // 2️⃣ Save URL in MongoDB (Quotation)
        const quotation = await Quotation.findByIdAndUpdate(
            quotationId,
            {
                $set: {
                    pdfUrl: url,
                    from: hospitalId,
                    quotationStatus: "Created", // ✅ mark as created when PDF is uploaded
                    isUploaded: true, // ✅ set isUploaded to true after successful upload
                },
            },
            { new: true }
        );

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found",
            });
        }

        // 3️⃣ Update Enquiry with quotation sent date & status
        await Enquiry.findByIdAndUpdate(
            quotation.enquiry,
            {
                $set: {
                    "enquiryStatus": "Quotation Sent",
                    "quotationStatus": "Created",
                    "enquiryStatusDates.quotationSentOn": new Date(),
                },
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Quotation PDF uploaded and quotation sent date updated successfully",
            pdfUrl: url,
            quotation,
            isUploaded: true,
        });
    } catch (error) {
        console.error("Error uploading quotation PDF:", error);
        // Optionally: If upload fails, ensure isUploaded remains false (already default, but could explicitly set if needed)
        res.status(500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
});

const shareQuotation = asyncHandler(async (req, res) => {
    try {
        const { hospitalId, enquiryId, quotationId } = req.params;
        console.log("🚀 ~ quotationId:", quotationId)
        console.log("🚀 ~ enquiryId:", enquiryId)
        console.log("🚀 ~ hospitalId:", hospitalId)

        if (!hospitalId || !enquiryId || !quotationId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId, enquiryId, and quotationId are required",
            });
        }

        // Find the quotation by quotationId and enquiryId
        const quotation = await Quotation.findOne({
            _id: quotationId,
            enquiry: enquiryId,
        });

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: "Quotation not found for the given IDs",
            });
        }

        if (!quotation.pdfUrl) {
            return res.status(400).json({
                success: false,
                message: "Quotation PDF not uploaded yet. Cannot share.",
            });
        }

        // Update quotation status to 'Pending' (or whatever status you want)
        quotation.quotationStatus = 'Created'; // or 'Pending' if you prefer
        await quotation.save();

        // Optionally, update the enquiry status as well
        await Enquiry.findByIdAndUpdate(enquiryId, {
            enquiryStatus: 'Quotation Sent',
            'enquiryStatusDates.quotationSentOn': new Date(),
        });

        // Return the existing PDF URL and updated status
        res.status(200).json({
            success: true,
            message: "Quotation PDF shared successfully",
            data: {
                hospitalId,
                enquiryId,
                quotationId,
                pdfUrl: quotation.pdfUrl,
                quotationStatus: quotation.quotationStatus, // ✅ include updated status
            },
        });
    } catch (error) {
        console.error("Error sharing quotation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to share quotation",
            error: error.message,
        });
    }
});


//mobile
const getQuotationPdfUrl = asyncHandler(async (req, res) => {
    try {
        const { hospitalId, enquiryId } = req.params;

        if (!hospitalId || !enquiryId) {
            return res.status(400).json({
                success: false,
                message: "hospitalId and enquiryId are required",
            });
        }

        // Find the quotation for the given hospital and enquiry
        const quotation = await Quotation.findOne({
            from: hospitalId,
            enquiry: enquiryId,
        }).select("pdfUrl quotationStatus"); // Only select the pdfUrl field
        console.log("🚀 ~ quotation:", quotation)

        if (!quotation || !quotation.pdfUrl) {
            return res.status(404).json({
                success: false,
                message: "Quotation PDF not found for the given hospital and enquiry",
            });
        }
        res.status(200).json({
            success: true,
            pdfUrl: quotation.pdfUrl,
            id: quotation._id,
            quotationStatus: quotation.quotationStatus
        });
    } catch (error) {
        console.error("Error fetching quotation PDF URL:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch quotation PDF URL",
            error: error.message,
        });
    }
});


const getNextQuotationNumber = async (req, res) => {
    try {
        // 1️⃣ Increment the sequence for "quotation"
        const counter = await counterModel.findOneAndUpdate(
            { entity: "quotation" },      // use 'entity' field instead of 'name'
            { $inc: { seq: 1 } },         // increment seq by 1
            { new: true, upsert: true }   // create if doesn't exist, return updated doc
        );

        const sequenceNumber = counter.seq;

        // 2️⃣ Generate 4-digit random part
        const randomPart = Math.floor(1000 + Math.random() * 9000);

        // 3️⃣ Pad sequence number to 1 digits
        const paddedSequence = sequenceNumber.toString().padStart(1, "0");

        // 4️⃣ Combine into final quotation number
        const quotationNumber = `QU${randomPart}${paddedSequence}`;

        // 5️⃣ Return the quotation number
        res.json({ nextNumber: quotationNumber });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate quotation number" });
    }
};


export const getQuotationHistory = asyncHandler(async (req, res) => {
    try {
        const { quotationId } = req.params;

        if (!quotationId) {
            return res.status(400).json({ message: "Quotation ID is required" });
        }

        // 1️⃣ Find the main quotation to get its readable ID
        const quotation = await Quotation.findById(quotationId).select("quotationId");
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        // 2️⃣ Fetch history and project only required fields
        const historyRecords = await QuotationHistory.find({ quotation: quotationId })
            .sort({ createdAt: -1 })
            .select("status pdfUrl date")
            .lean();

        if (!historyRecords || historyRecords.length === 0) {
            return res.status(200).json({
                message: "No history found for this quotation",
            });
        }

        // 3️⃣ Map data into a clean array
        const formattedHistory = historyRecords.map((record) => ({
            quotationNumber: quotation.quotationId,
            status: record.status,
            pdfUrl: record.pdfUrl,
            date: record.date,
        }));

        // 4️⃣ Send response
        res.status(200).json({
            success: true,
            message: "Quotation history fetched successfully",
            data: formattedHistory,
        });
    } catch (error) {
        console.error("Error in getQuotationHistory:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching quotation history",
            error: error.message,
        });
    }
});

export default { acceptQuotation, rejectQuotation, createQuotationByEnquiryId, getQuotationByEnquiryId, getQuotationByIds, acceptQuotationPDF, downloadQuotationPdf, shareQuotation, getQuotationPdfUrl, updateQuotationById, getNextQuotationNumber, getQuotationHistory }