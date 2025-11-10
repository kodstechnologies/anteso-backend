import Enquiry from "../../models/enquiry.model.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";
import { enquirySchema } from "../../validators/enquiryValidators.js";
import mongoose from "mongoose";
import User from "../../models/user.model.js";
import Quotation from "../../models/quotation.model.js";
import orderModel from "../../models/order.model.js";
import Service from '../../models/Services.js'
import AdditionalService from "../../models/additionalService.model.js";
import { getS3SignedUrl, uploadToS3 } from '../../utils/s3Upload.js'
import Hospital from '../../models/hospital.model.js'
import Client from "../../models/client.model.js";
// const add = asyncHandler(async (req, res) => {
//     try {
//         // Validate input
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });

//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         // 1. Create the enquiry
//         const newEnquiry = await Enquiry.create(value);

//         // 2. Push this enquiry to the related customer (if customer exists)
//         if (newEnquiry.customer) {
//             await User.findByIdAndUpdate(
//                 newEnquiry.customer,
//                 { $push: { enquiries: newEnquiry._id } },
//                 { new: true }
//             );
//         }

//         // 3. Return response
//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });



// const add = asyncHandler(async (req, res) => {
//     try {
//         // Validate input
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });

//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         let customerId = value.customer;

//         // Check if customer exists (based on email or phone)
//         if (!customerId) {
//             const { emailAddress, contactNumber, hospitalName } = value;
//             let existingCustomer = null;
//             if (emailAddress) {
//                 existingCustomer = await User.findOne({ emailAddress });
//             } else if (contactNumber) {
//                 existingCustomer = await User.findOne({ contactNumber });
//             }
//             if (!existingCustomer) {
//                 // Create a new customer
//                 const newCustomer = await User.create({
//                     name: hospitalName,
//                     email: emailAddress,
//                     phone: contactNumber,
//                 });
//                 customerId = newCustomer._id;
//             } else {
//                 customerId = existingCustomer._id;
//             }
//             value.customer = customerId;
//         }
//         // Create the enquiry
//         const newEnquiry = await Enquiry.create(value);
//         // Push this enquiry to the related customer
//         await User.findByIdAndUpdate(
//             customerId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );
//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });


//after adding additional services--wrong one
// const add = asyncHandler(async (req, res) => {
//     try {
//         // enq Validate input
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });
//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         let customerId = value.customer;

//         // Check if customer exists (based on email or phone)
//         if (!customerId) {
//             const { emailAddress, contactNumber, hospitalName } = value;

//             let existingCustomer = null;
//             if (emailAddress) {
//                 existingCustomer = await User.findOne({ emailAddress });
//             } else if (contactNumber) {
//                 existingCustomer = await User.findOne({ contactNumber });
//             }

//             if (!existingCustomer) {
//                 // Create a new customer
//                 const newCustomer = await User.create({
//                     name: hospitalName,
//                     email: emailAddress,
//                     phone: contactNumber,
//                 });
//                 customerId = newCustomer._id;
//             } else {
//                 customerId = existingCustomer._id;
//             }
//             value.customer = customerId;
//         }
//         // Handle file uploads to S3
//         let attachments = [];
//         if (req.files && req.files.length > 0) {
//             const uploadPromises = req.files.map(async (file) => {
//                 const { url, key } = await uploadToS3(file);
//                 return {
//                     filename: file.originalname,
//                     key,
//                     url,
//                     mimetype: file.mimetype,
//                     size: file.size,
//                 };
//             });
//             attachments = await Promise.all(uploadPromises);
//         }
//         //  Attach files to enquiry payload
//         value.attachments = attachments;
//         let serviceIds = [];
//         if (value.services && value.services.length > 0) {
//             console.log("Services payload before insert:", value.services);

//             // Transform each service to match Service schema
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending"
//                 }))
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }
//         // ✅ Create Enquiry with references to services
//         const newEnquiry = await Enquiry.create({
//             ...value,
//             services: serviceIds,
//             enquiryStatusDates: {
//                 enquiredOn: new Date()
//             }
//         });
//         // ✅ Link enquiry to customer
//         await User.findByIdAndUpdate(
//             customerId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );
//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });


//not working
// const add = asyncHandler(async (req, res) => {
//     try {
//         // ✅ Validate input
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });
//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }
//         console.log("Received AdditionalServices:", value.additionalServices);

//         let customerId = value.customer;

//         // ✅ Check if customer exists or create new
//         if (!customerId) {
//             const { emailAddress, contactNumber, hospitalName } = value;

//             let existingCustomer = null;
//             if (emailAddress) {
//                 existingCustomer = await User.findOne({ emailAddress });
//             } else if (contactNumber) {
//                 existingCustomer = await User.findOne({ contactNumber });
//             }

//             if (!existingCustomer) {
//                 const newCustomer = await User.create({
//                     name: hospitalName,
//                     email: emailAddress,
//                     phone: contactNumber,
//                 });
//                 customerId = newCustomer._id;
//             } else {
//                 customerId = existingCustomer._id;
//             }
//             value.customer = customerId;
//         }

//         //  Handle file uploads to S3
//         let attachments = [];
//         if (req.files && req.files.length > 0) {
//             const uploadPromises = req.files.map(async (file) => {
//                 const { url, key } = await uploadToS3(file);
//                 return {
//                     filename: file.originalname,
//                     key,
//                     url,
//                     mimetype: file.mimetype,
//                     size: file.size,
//                 };
//             });
//             attachments = await Promise.all(uploadPromises);
//         }
//         value.attachments = attachments;

//         //  Create Services first
//         let serviceIds = [];
//         if (value.services && value.services.length > 0) {
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending",
//                 })),
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }

//         //  Create Additional Services (new logic)
//         let additionalServiceIds = [];
//         if (value.additionalServices && value.additionalServices.length > 0) {
//             // Suppose frontend sends array of { name, description } objects
//             const createdAdditionalServices = await AdditionalService.insertMany(
//                 value.additionalServices.map((a) => ({
//                     name: a.name,
//                     description: a.description || "",
//                 }))
//             );
//             additionalServiceIds = createdAdditionalServices.map((a) => a._id);
//         }

//         const {
//             additionalServices, // remove raw additional services from value
//             services,
//             ...rest
//         } = value;

//         const newEnquiry = await Enquiry.create({
//             ...rest,
//             services: serviceIds,
//             additionalServices: additionalServiceIds, // only ObjectIds here
//             enquiryStatusDates: {
//                 enquiredOn: new Date(),
//             },
//         });

//         //  Link enquiry to customer
//         await User.findByIdAndUpdate(
//             customerId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );

//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });




// const add = asyncHandler(async (req, res) => {
//     try {
//         // ✅ Validate input
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });
//         console.log("Received AdditionalServices:", value.additionalServices);
//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         console.log("Received AdditionalServices:", value.additionalServices);

//         let customerId = value.customer;

//         // ✅ Check if customer exists or create new
//         if (!customerId) {
//             const { emailAddress, contactNumber, hospitalName } = value;

//             let existingCustomer = null;

//             if (emailAddress) {
//                 existingCustomer = await User.findOne({ email: emailAddress });
//             }
//             if (!existingCustomer && contactNumber) {
//                 existingCustomer = await User.findOne({ phone: contactNumber });
//             }


//             //  If customer already exists → stop here
//             console.log("🚀 ~ existingCustomer:", existingCustomer)
//             if (existingCustomer) {
//                 return res.status(200).json(
//                     new ApiResponse(
//                         200,
//                         { existingCustomer },
//                         "Customer already exists. Please enquire via mobile app."
//                     )
//                 );
//             }

//             // ✅ Create a new customer only if not found
//             // ✅ Create a new customer only if not found
//             const newCustomer = await User.create({
//                 name: hospitalName,
//                 email: emailAddress,
//                 phone: contactNumber,
//                 role: "Customer",   // 👈 ensure discriminator works properly
//             });
//             customerId = newCustomer._id;

//             value.customer = customerId;

//         }

//         // ✅ Handle file uploads to S3
//         let attachments = [];
//         if (req.files && req.files.length > 0) {
//             const uploadPromises = req.files.map(async (file) => {
//                 const { url, key } = await uploadToS3(file);
//                 return {
//                     filename: file.originalname,
//                     key,
//                     url,
//                     mimetype: file.mimetype,
//                     size: file.size,
//                 };
//             });
//             attachments = await Promise.all(uploadPromises);
//         }
//         value.attachments = attachments;
//         // ✅ Create Services first
//         let serviceIds = [];
//         if (value.services && value.services.length > 0) {
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending",
//                 })),
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }
//         // ✅ Create Enquiry
//         let additionalServiceIds = [];
//         if (value.additionalServices && Object.keys(value.additionalServices).length > 0) {
//             const createdAdditionalServices = await AdditionalService.insertMany(
//                 Object.entries(value.additionalServices).map(([name, data]) => ({
//                     name,
//                     description: data.description || "",
//                     totalAmount: data.totalAmount || 0,
//                 }))
//             );
//             additionalServiceIds = createdAdditionalServices.map(a => a._id);
//         }
//         // remove raw arrays from value before creating enquiry
//         const {
//             additionalServices, // strip raw
//             services,
//             ...rest
//         } = value;
//         const newEnquiry = await Enquiry.create({
//             ...rest,
//             services: serviceIds,
//             additionalServices: additionalServiceIds, // ✅ link ObjectIds
//             enquiryStatusDates: {
//                 enquiredOn: new Date(),
//             },
//         });
//         // const newEnquiry = await Enquiry.create({
//         //     ...value,
//         //     services: serviceIds,
//         // });

//         // ✅ Link enquiry to customer
//         await User.findByIdAndUpdate(
//             customerId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );
//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });


// controllers/enquiry.controller.js
// const add = asyncHandler(async (req, res) => {
//     try {
//         console.log("🚀 ~ req.body:", req.body)

//         // ✅ Validate input
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });

//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         let customerId = value.customer;

//         // ✅ Check if customer exists or create new
//         if (!customerId) {
//             const { emailAddress, contactNumber, hospitalName, fullAddress, branch, contactPerson } = value;

//             let existingCustomer = null;
//             // if (emailAddress) {
//             //     existingCustomer = await User.findOne({ email: emailAddress });
//             // }
//             if (contactNumber) {
//                 existingCustomer = await User.findOne({ phone: contactNumber });
//             }

//             if (existingCustomer) {
//                 return res.status(200).json(
//                     new ApiResponse(
//                         200,
//                         { existingCustomer },
//                         "Customer already exists. Please enquire via mobile app."
//                     )
//                 );
//             }

//             // ✅ Create Customer
//             const newCustomer = await User.create({
//                 name: contactPerson,
//                 email: emailAddress,
//                 phone: contactNumber,
//                 role: "Customer", // 👈 discriminator field
//             });

//             customerId = newCustomer._id;
//             value.customer = customerId;

//             // ✅ Create Hospital for this customer
//             const newHospital = await Hospital.create({
//                 name: hospitalName,
//                 email: emailAddress,
//                 address: fullAddress,
//                 branch: branch,
//                 phone: contactNumber,
//             });

//             // Link hospital back to customer
//             await Client.findByIdAndUpdate(customerId, {
//                 $push: { hospitals: newHospital._id },
//             });
//             value.hospital = newHospital._id;
//         }

//         // ✅ Handle file uploads to S3
//         let attachments = [];
//         if (req.files && req.files.length > 0) {
//             const uploadPromises = req.files.map(async (file) => {
//                 const { url, key } = await uploadToS3(file);
//                 return {
//                     filename: file.originalname,
//                     key,
//                     url,
//                     mimetype: file.mimetype,
//                     size: file.size,
//                 };
//             });
//             attachments = await Promise.all(uploadPromises);
//         }
//         value.attachments = attachments;

//         // ✅ Create Services
//         let serviceIds = [];
//         if (value.services && value.services.length > 0) {
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending",
//                 })),
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }

//         // ✅ Create Additional Services
//         let additionalServiceIds = [];
//         if (value.additionalServices && Object.keys(value.additionalServices).length > 0) {
//             const createdAdditionalServices = await AdditionalService.insertMany(
//                 Object.entries(value.additionalServices).map(([name, data]) => ({
//                     name,
//                     description: data.description || "",
//                     totalAmount: data.totalAmount || 0,
//                 }))
//             );
//             additionalServiceIds = createdAdditionalServices.map((a) => a._id);
//         }

//         const { additionalServices, services, ...rest } = value;

//         // ✅ Create Enquiry
//         const newEnquiry = await Enquiry.create({
//             ...rest,
//             services: serviceIds,
//             additionalServices: additionalServiceIds,
//             enquiryStatusDates: { enquiredOn: new Date() },
//         });

//         // ✅ Link enquiry to customer
//         await User.findByIdAndUpdate(customerId, {
//             $push: { enquiries: newEnquiry._id },
//         });

//         // ✅ Link enquiry to hospital
//         if (value.hospital) {
//             await Hospital.findByIdAndUpdate(value.hospital, {
//                 $push: { enquiries: newEnquiry._id },
//             });
//         }

//             console.log("🚀 ~ newEnquiry:", newEnquiry)
//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });

// const add = asyncHandler(async (req, res) => {
//     try {
//         console.log("🚀 ~ req.file:", req.file); // single file
//         console.log("🚀 ~ req.body:", req.body); // other form fields

//         // ✅ Step 1: Preprocess services & additionalServices
//         let body = { ...req.body };

//         if (typeof body.services === "string") {
//             try {
//                 body.services = JSON.parse(body.services);
//             } catch (err) {
//                 throw new ApiError(400, "Invalid JSON format in services");
//             }
//         }

//         if (typeof body.additionalServices === "string") {
//             try {
//                 body.additionalServices = JSON.parse(body.additionalServices);
//             } catch (err) {
//                 throw new ApiError(400, "Invalid JSON format in additionalServices");
//             }
//         }

//         // ✅ Step 2: Validate input with Joi
//         const { error, value } = enquirySchema.validate(body, {
//             abortEarly: false,
//         });

//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         let customerId = value.customer;

//         // ✅ Step 3: Customer handling
//         if (!customerId) {
//             const { emailAddress, contactNumber, hospitalName, fullAddress, branch, contactPerson } = value;

//             let existingCustomer = null;
//             if (contactNumber) {
//                 existingCustomer = await User.findOne({ phone: contactNumber });
//             }

//             if (existingCustomer) {
//                 return res.status(200).json(
//                     new ApiResponse(
//                         200,
//                         { existingCustomer },
//                         "Customer already exists. Please enquire via mobile app."
//                     )
//                 );
//             }

//             // Create Customer
//             const newCustomer = await User.create({
//                 name: contactPerson,
//                 email: emailAddress,
//                 phone: contactNumber,
//                 role: "Customer",
//             });

//             customerId = newCustomer._id;
//             value.customer = customerId;

//             // Create Hospital for this customer
//             const newHospital = await Hospital.create({
//                 name: hospitalName,
//                 email: emailAddress,
//                 address: fullAddress,
//                 branch: branch,
//                 phone: contactNumber,
//             });

//             // Link hospital back to customer
//             await Client.findByIdAndUpdate(customerId, {
//                 $push: { hospitals: newHospital._id },
//             });
//             value.hospital = newHospital._id;
//         }

//         // ✅ Step 4: Handle file uploads to S3
//         let attachments = [];
//         // ✅ Step 4: Handle single file upload to S3
//         if (req.file) {
//             const { url } = await uploadToS3(req.file);
//             value.attachment = url; // matches your schema
//         }

//         value.attachments = attachments;

//         // ✅ Step 5: Create Services
//         let serviceIds = [];
//         if (value.services && value.services.length > 0) {
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending",
//                 })),
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }

//         // ✅ Step 6: Create Additional Services
//         let additionalServiceIds = [];
//         if (value.additionalServices && Object.keys(value.additionalServices).length > 0) {
//             const createdAdditionalServices = await AdditionalService.insertMany(
//                 Object.entries(value.additionalServices).map(([name, data]) => ({
//                     name,
//                     description: data.description || "",
//                     totalAmount: data.totalAmount || 0,
//                 }))
//             );
//             additionalServiceIds = createdAdditionalServices.map((a) => a._id);
//         }

//         const { additionalServices, services, ...rest } = value;

//         // ✅ Step 7: Create Enquiry
//         const newEnquiry = await Enquiry.create({
//             ...rest,
//             services: serviceIds,
//             additionalServices: additionalServiceIds,
//             enquiryStatusDates: { enquiredOn: new Date() },
//             attachment: value.attachment, // single file URL

//         });

//         // ✅ Step 8: Link enquiry to customer
//         await User.findByIdAndUpdate(customerId, {
//             $push: { enquiries: newEnquiry._id },
//         });

//         // ✅ Step 9: Link enquiry to hospital
//         if (value.hospital) {
//             await Hospital.findByIdAndUpdate(value.hospital, {
//                 $push: { enquiries: newEnquiry._id },
//             });
//         }

//         console.log("🚀 ~ newEnquiry:", newEnquiry);
//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });

const add = asyncHandler(async (req, res) => {
    try {
        console.log("🚀 ~ req.file:", req.file);
        console.log("🚀 ~ req.body:", req.body);

        // ✅ Step 1: Parse services & additionalServices
        let body = { ...req.body };

        if (typeof body.services === "string") {
            try {
                body.services = JSON.parse(body.services);
            } catch {
                throw new ApiError(400, "Invalid JSON format in services");
            }
        }

        if (typeof body.additionalServices === "string") {
            try {
                body.additionalServices = JSON.parse(body.additionalServices);
            } catch {
                throw new ApiError(400, "Invalid JSON format in additionalServices");
            }
        }

        // ✅ Step 2: Validate with Joi
        const { error, value } = enquirySchema.validate(body, { abortEarly: false });
        if (error) {
            const errorMessages = error.details.map((err) => err.message);
            throw new ApiError(400, "Validation failed", errorMessages);
        }

        let customerId = value.customer;

        // ✅ Step 3: Customer Handling
        if (!customerId) {
            const { emailAddress, contactNumber, hospitalName, fullAddress, branch, contactPerson } = value;

            // Check existing by email
            if (emailAddress) {
                const existingByEmail = await User.findOne({ email: emailAddress });
                if (existingByEmail) {
                    return res.status(400).json(
                        new ApiResponse(
                            400,
                            { existingByEmail },
                            "Email already exists. Please enter another email."
                        )
                    );
                }
            }

            // Check existing by phone
            let existingCustomer = null;
            if (contactNumber) {
                existingCustomer = await User.findOne({ phone: contactNumber });
            }

            if (existingCustomer) {
                return res.status(200).json(
                    new ApiResponse(
                        200,
                        { existingCustomer },
                        "Customer already exists. Please enquire via mobile app."
                    )
                );
            }

            // ✅ Create Customer using the correct discriminator (Client)
            const newCustomer = await Client.create({
                name: contactPerson,
                email: emailAddress,
                phone: contactNumber,
            });

            customerId = newCustomer._id;
            value.customer = customerId;

            // ✅ Create Hospital linked to this Customer
            const newHospital = await Hospital.create({
                name: hospitalName,
                email: emailAddress,
                address: fullAddress,
                branch,
                phone: contactNumber,
                customer: newCustomer._id, // Link back
            });

            // ✅ Push hospital to Customer (MUST use Client, not User)
            await Client.findByIdAndUpdate(customerId, {
                $push: { hospitals: newHospital._id },
            });

            value.hospital = newHospital._id;
        }

        // ✅ Step 4: Handle file upload
        if (req.file) {
            const { url } = await uploadToS3(req.file);
            value.attachment = url;
        }

        // ✅ Step 5: Create Services
        // Step 5: Create Services
        let serviceIds = [];
        if (value.services && value.services.length > 0) {
            const transformedServices = value.services.map((s) => ({
                machineType: s.machineType,
                quantity: s.quantity,                    // NEW: include quantity
                equipmentNo: s.equipmentNo,
                machineModel: s.machineModel,
                serialNumber: s.equipmentNo || "",
                remark: s.remark || "",
                workTypeDetails: (s.workType || []).map((wt) => ({
                    workType: wt,
                    status: "pending",
                })),
            }));
            const createdServices = await Service.insertMany(transformedServices);
            serviceIds = createdServices.map((s) => s._id);
        }

        // ✅ Step 6: Create Additional Services
        let additionalServiceIds = [];
        if (value.additionalServices && Object.keys(value.additionalServices).length > 0) {
            const createdAdditionalServices = await AdditionalService.insertMany(
                Object.entries(value.additionalServices).map(([name, data]) => ({
                    name,
                    description: data.description || "",
                    totalAmount: data.totalAmount || 0,
                }))
            );
            additionalServiceIds = createdAdditionalServices.map((a) => a._id);
        }

        const { additionalServices, services, ...rest } = value;

        // ✅ Step 7: Create Enquiry
        const newEnquiry = await Enquiry.create({
            ...rest,
            services: serviceIds,
            additionalServices: additionalServiceIds,
            enquiryStatusDates: { enquiredOn: new Date() },
            attachment: value.attachment,
        });

        // ✅ Step 8: Link enquiry to customer (use Client model)
        await Client.findByIdAndUpdate(customerId, {
            $push: { enquiries: newEnquiry._id },
        });

        // ✅ Step 9: Link enquiry to hospital
        if (value.hospital) {
            await Hospital.findByIdAndUpdate(value.hospital, {
                $push: { enquiries: newEnquiry._id },
            });
        }

        console.log("🚀 ~ newEnquiry:", newEnquiry);
        return res.status(201).json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
    } catch (error) {
        console.error("Create Enquiry Error:", error);
        throw new ApiError(500, "Failed to create enquiry", [error.message]);
    }
});


// export const createDirectOrder = asyncHandler(async (req, res) => {
//     try {
//         console.log("🚀 Raw body:-------------------------->", req.body);
//         console.log("🚀 File:", req.file?.originalname);

//         let {
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
//             customer,
//         } = req.body;

//         // ✅ Safe JSON parsing
//         try { services = services ? JSON.parse(services) : []; } catch { services = []; }
//         try { additionalServices = additionalServices ? JSON.parse(additionalServices) : {}; } catch { additionalServices = {}; }

//         // ✅ Validate required fields
//         const requiredFields = { hospitalName, fullAddress, city, state, pinCode, contactPersonName, contactNumber };
//         const missing = Object.entries(requiredFields).filter(([_, v]) => !v);
//         if (missing.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: `Missing required fields: ${missing.map(([k]) => k).join(", ")}`,
//             });
//         }

//         // ✅ Fetch lead owner user
//         const leadOwnerUser = leadOwner ? await User.findById(leadOwner) : null;
//         if (!leadOwnerUser) {
//             return res.status(404).json({ success: false, message: "Lead owner not found" });
//         }

//         // ✅ Handle Customer
//         let customerDoc;
//         let customerId = customer;
//         if (!customerId) {
//             customerDoc = await Client.findOne({
//                 $or: [{ email: emailAddress }, { phone: contactNumber }],
//             });

//             if (!customerDoc) {
//                 customerDoc = await Client.create({
//                     name: contactPersonName,
//                     email: emailAddress,
//                     phone: contactNumber,
//                     hospitals: [],
//                 });
//             }
//             customerId = customerDoc._id;
//         } else {
//             customerDoc = await Client.findById(customerId);
//         }

//         if (!customerDoc) {
//             return res.status(400).json({ success: false, message: "Failed to create or fetch customer" });
//         }

//         // ✅ Handle Hospital
//         let hospitalDoc = await Hospital.findOne({ name: hospitalName, customer: customerId });
//         if (!hospitalDoc) {
//             hospitalDoc = await Hospital.create({
//                 name: hospitalName,
//                 email: emailAddress,
//                 address: fullAddress,
//                 branch: branchName,
//                 phone: contactNumber,
//                 customer: customerId,
//             });
//             await Client.findByIdAndUpdate(customerId, { $addToSet: { hospitals: hospitalDoc._id } });
//         }

//         // ✅ File upload (workOrderCopy or attachment)
//         let attachmentUrl = "";
//         if (req.file) {
//             const uploadedFile = await uploadToS3(req.file);
//             attachmentUrl = uploadedFile.url;
//         }

//         // ✅ Create service docs
//         const serviceIds = await Promise.all(
//             (services || []).map(async (s) => {
//                 const serviceDoc = await Service.create({
//                     machineType: s.machineType,
//                     equipmentNo: s.equipmentNo,
//                     machineModel: s.machineModel,
//                     serialNumber: s.serialNumber || "",
//                     remark: s.remark || "",
//                     workTypeDetails: (s.workType || []).map((wt) => ({
//                         workType: wt,
//                         status: "pending",
//                     })),
//                 });
//                 return serviceDoc._id;
//             })
//         );

//         // ✅ Create additional services
//         let additionalServiceIds = [];
//         if (additionalServices && Object.keys(additionalServices).length > 0) {
//             const additionalServiceDocs = await AdditionalService.insertMany(
//                 Object.entries(additionalServices).map(([name, description]) => ({
//                     name,
//                     description: description || "",
//                     totalAmount: 0,
//                 }))
//             );
//             additionalServiceIds = additionalServiceDocs.map((a) => a._id);
//         }

//         // ✅ Role-based flow
//         if (leadOwnerUser.role === "Employee") {
//             // 🟢 EMPLOYEE → Only Enquiry
//             const enquiry = await Enquiry.create({
//                 leadOwner,
//                 hospital: hospitalDoc._id,
//                 hospitalName,
//                 fullAddress,
//                 city,
//                 district,
//                 state,
//                 pinCode,
//                 branch: branchName,
//                 contactPerson: contactPersonName,
//                 emailAddress,
//                 contactNumber,
//                 designation,
//                 services: serviceIds,
//                 additionalServices: additionalServiceIds,
//                 specialInstructions,
//                 attachment: attachmentUrl,
//                 enquiryStatus: "Enquired",
//                 enquiryStatusDates: { enquiredOn: new Date() },
//                 customer: customerId,
//                 quotationStatus: "Create",
//             });

//             return res
//                 .status(201)
//                 .json(new ApiResponse(201, { enquiry }, "Enquiry created successfully (Employee)"));
//         }

//         if (leadOwnerUser.role === "Dealer") {
//             // 🟠 DEALER → Only Direct Order
//             const newOrder = await orderModel.create({
//                 leadOwner,
//                 hospital: hospitalDoc._id,
//                 hospitalName,
//                 fullAddress,
//                 city,
//                 district,
//                 state,
//                 pinCode,
//                 branchName,
//                 contactPersonName,
//                 emailAddress,
//                 contactNumber,
//                 designation,
//                 advanceAmount,
//                 urgency,
//                 services: serviceIds,
//                 additionalServices: additionalServiceIds,
//                 specialInstructions,
//                 workOrderCopy: attachmentUrl,
//                 customer: customerId,
//             });

//             return res
//                 .status(201)
//                 .json(new ApiResponse(201, { order: newOrder }, "Direct Order created successfully (Dealer)"));
//         }

//         // 🚫 Any other role
//         return res.status(403).json({
//             success: false,
//             message: "Unauthorized role. Only Employee or Dealer can create records.",
//         });

//     } catch (error) {
//         console.error("❌ Create Direct Order Error:", error);

//         // 🧩 Handle Duplicate Key Error (e.g., duplicate email)
//         if (error.code === 11000) {
//             const field = Object.keys(error.keyPattern || {})[0];
//             const value = error.keyValue?.[field];

//             return res.status(409).json({
//                 success: false,
//                 message: ` A record with the same ${field} (${value}) already exists.`,
//             });
//         }

//         // 🧩 Handle Validation Errors (optional improvement)
//         if (error.name === "ValidationError") {
//             const messages = Object.values(error.errors).map((err) => err.message);
//             return res.status(400).json({
//                 success: false,
//                 message: "Validation failed",
//                 errors: messages,
//             });
//         }

//         // 🧩 Default Server Error
//         return res.status(500).json({
//             success: false,
//             message: "Failed to create direct order due to a server error.",
//             error: error.message,
//         });
//     }
// });



// const addByCustomerId = asyncHandler(async (req, res) => {
//     try {
//         const { customerId } = req.params;

//         if (!customerId) {
//             throw new ApiError(400, "Customer ID is required");
//         }

//         // ✅ Ensure customer exists
//         const existingCustomer = await User.findById(customerId);
//         if (!existingCustomer) {
//             throw new ApiError(404, "Customer not found");
//         }

//         // ✅ Validate enquiry input
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });

//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         // ✅ Force customer ID into payload
//         value.customer = customerId;

//         // ✅ Handle file uploads to S3
//         let attachments = [];
//         if (req.files && req.files.length > 0) {
//             const uploadPromises = req.files.map(async (file) => {
//                 const { url, key } = await uploadToS3(file);
//                 return {
//                     filename: file.originalname,
//                     key,
//                     url,
//                     mimetype: file.mimetype,
//                     size: file.size,
//                 };
//             });

//             attachments = await Promise.all(uploadPromises);
//         }

//         value.attachments = attachments;

//         // ✅ Create enquiry
//         const newEnquiry = await Enquiry.create(value);

//         // ✅ Link enquiry to customer
//         await User.findByIdAndUpdate(
//             customerId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );

//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry (by customerId) Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });


// const addByHospitalId = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId } = req.params;
//         if (!hospitalId) throw new ApiError(400, "Hospital ID is required");

//         // 🔍 Check if hospital exists
//         const existingHospital = await Hospital.findById(hospitalId);
//         if (!existingHospital) throw new ApiError(404, "Hospital not found");

//         let value = { ...req.body };

//         // Parse JSON fields safely
//         if (value.services && typeof value.services === "string") {
//             try { value.services = JSON.parse(value.services); } catch { value.services = []; }
//         }
//         if (value.additionalServices && typeof value.additionalServices === "string") {
//             try { value.additionalServices = JSON.parse(value.additionalServices); } catch { value.additionalServices = {}; }
//         }

//         // ✅ Attach hospital
//         value.hospital = hospitalId;

//         // ✅ Attach customer if passed (optional)
//         if (req.body.customerId) {
//             value.customer = req.body.customerId;
//         }

//         // ✅ Single file upload
//         if (req.file) {
//             const { url } = await uploadToS3(req.file);
//             value.attachment = url;
//         }

//         // Create services
//         let serviceIds = [];
//         if (Array.isArray(value.services) && value.services.length > 0) {
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending",
//                 })),
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }

//         // Create additional services
//         let additionalServiceIds = [];
//         if (value.additionalServices && typeof value.additionalServices === "object" && Object.keys(value.additionalServices).length > 0) {
//             const createdAdditionalServices = await AdditionalService.insertMany(
//                 Object.entries(value.additionalServices).map(([name, data]) => ({
//                     name,
//                     description: data.description || "",
//                     totalAmount: data.totalAmount || 0,
//                 }))
//             );
//             additionalServiceIds = createdAdditionalServices.map((a) => a._id);
//         }

//         // Final enquiry creation
//         let newEnquiry = await Enquiry.create({
//             ...value,
//             services: serviceIds,
//             additionalServices: additionalServiceIds,
//             enquiryStatusDates: { enquiredOn: new Date() },
//         });

//         await Hospital.findByIdAndUpdate(
//             hospitalId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );

//         // ✅ Populate services & additionalServices before sending response
//         newEnquiry = await Enquiry.findById(newEnquiry._id)
//             .populate("services")
//             .populate("additionalServices");

//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });



export const createDirectOrder = asyncHandler(async (req, res) => {
    try {
        console.log("🚀 Raw body:", req.body);
        console.log("🚀 File:", req.file?.originalname);

        // ✅ Step 1: Parse JSON fields
        let body = { ...req.body };

        if (typeof body.services === "string") {
            try {
                body.services = JSON.parse(body.services);
            } catch {
                throw new ApiError(400, "Invalid JSON format in services");
            }
        }

        if (typeof body.additionalServices === "string") {
            try {
                body.additionalServices = JSON.parse(body.additionalServices);
            } catch {
                throw new ApiError(400, "Invalid JSON format in additionalServices");
            }
        }

        // ✅ Step 2: Validate required fields
        const requiredFields = {
            hospitalName: body.hospitalName,
            fullAddress: body.fullAddress,
            city: body.city,
            state: body.state,
            pinCode: body.pinCode,
            contactPersonName: body.contactPersonName,
            contactNumber: body.contactNumber,
        };
        const missing = Object.entries(requiredFields).filter(([_, v]) => !v);
        if (missing.length) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.map(([k]) => k).join(", ")}`,
            });
        }

        // ✅ Step 3: Validate leadOwner
        const leadOwnerUser = body.leadOwner ? await User.findById(body.leadOwner) : null;
        if (!leadOwnerUser) {
            return res.status(404).json(new ApiResponse(404, null, "Lead owner not found"));
        }

        let customerId = body.customer;
        let hospitalDoc;

        // ✅ Step 4: Customer Handling (same logic as "add")
        if (!customerId) {
            const {
                emailAddress,
                contactNumber,
                hospitalName,
                fullAddress,
                branchName,
                contactPersonName,
            } = body;

            // 🔍 Check existing by email
            if (emailAddress) {
                const existingByEmail = await Client.findOne({ email: emailAddress });
                if (existingByEmail) {
                    return res.status(400).json(
                        new ApiResponse(
                            400,
                            { existingByEmail },
                            "Email already exists. Please enter another email."
                        )
                    );
                }
            }

            // 🔍 Check existing by phone
            let existingCustomer = null;
            if (contactNumber) {
                existingCustomer = await Client.findOne({ phone: contactNumber });
            }

            if (existingCustomer) {
                return res.status(400).json(
                    new ApiResponse(
                        400,
                        { existingCustomer },
                        "Mobile number already exists. Please enter another mobile number."
                    )
                );
            }

            // ✅ Create Customer (Client)
            const newCustomer = await Client.create({
                name: contactPersonName,
                email: emailAddress,
                phone: contactNumber,
            });

            customerId = newCustomer._id;

            // ✅ Create Hospital linked to Customer
            hospitalDoc = await Hospital.create({
                name: hospitalName,
                email: emailAddress,
                address: fullAddress,
                branch: branchName,
                phone: contactNumber,
                customer: newCustomer._id,
            });

            await Client.findByIdAndUpdate(customerId, {
                $push: { hospitals: hospitalDoc._id },
            });
        } else {
            // ✅ Customer already provided — fetch and link hospital
            const customerDoc = await Client.findById(customerId);
            if (!customerDoc) {
                return res.status(404).json(
                    new ApiResponse(404, null, "Customer ID provided but customer not found.")
                );
            }

            hospitalDoc = await Hospital.findOne({
                name: body.hospitalName,
                customer: customerId,
            });

            if (!hospitalDoc) {
                hospitalDoc = await Hospital.create({
                    name: body.hospitalName,
                    email: body.emailAddress,
                    address: body.fullAddress,
                    branch: body.branchName,
                    phone: body.contactNumber,
                    customer: customerId,
                });

                await Client.findByIdAndUpdate(customerId, {
                    $push: { hospitals: hospitalDoc._id },
                });
            }
        }

        // ✅ Step 5: Handle file upload (if any)
        let attachmentUrl = "";
        if (req.file) {
            const uploadedFile = await uploadToS3(req.file);
            attachmentUrl = uploadedFile.url;
        }




        // ✅ Step 6: Create Services
        let serviceIds = [];
        if (body.services && body.services.length > 0) {
            const transformedServices = body.services.map((s) => ({
                machineType: s.machineType,
                equipmentNo: s.equipmentNo,
                quantity: s.quantity,
                machineModel: s.machineModel,
                serialNumber: s.serialNumber || "",
                remark: s.remark || "",

                workTypeDetails: (s.workType || []).map((wt) => ({
                    workType: wt,
                    status: "pending",
                })),
            }));
            const createdServices = await Service.insertMany(transformedServices);
            serviceIds = createdServices.map((s) => s._id);
        }

        // ✅ Step 7: Create Additional Services
        let additionalServiceIds = [];
        if (body.additionalServices && Object.keys(body.additionalServices).length > 0) {
            const createdAdditionalServices = await AdditionalService.insertMany(
                Object.entries(body.additionalServices).map(([name, data]) => ({
                    name,
                    description: data.description || "",
                    totalAmount: data.totalAmount || 0,
                }))
            );
            additionalServiceIds = createdAdditionalServices.map((a) => a._id);
        }

        // ✅ Step 8: Role-based Flow
        if (leadOwnerUser.role === "Employee") {
            const enquiry = await Enquiry.create({
                leadOwner: body.leadOwner,
                hospital: hospitalDoc._id,
                hospitalName: body.hospitalName,
                fullAddress: body.fullAddress,
                city: body.city,
                district: body.district,
                state: body.state,
                pinCode: body.pinCode,
                branch: body.branchName,
                contactPerson: body.contactPersonName,
                emailAddress: body.emailAddress,
                contactNumber: body.contactNumber,
                designation: body.designation,
                services: serviceIds,
                additionalServices: additionalServiceIds,
                specialInstructions: body.specialInstructions,
                attachment: attachmentUrl,
                enquiryStatus: "Enquired",
                enquiryStatusDates: { enquiredOn: new Date() },
                customer: customerId,
                quotationStatus: "Create",
                createdBy: req.user?.id || null,
            });

            await Client.findByIdAndUpdate(customerId, {
                $push: { enquiries: enquiry._id },
            });

            await Hospital.findByIdAndUpdate(hospitalDoc._id, {
                $push: { enquiries: enquiry._id },
            });

            return res
                .status(201)
                .json(new ApiResponse(201, { enquiry }, "Enquiry created successfully (Employee)"));
        }

        if (leadOwnerUser.role === "Dealer") {
            const newOrder = await orderModel.create({
                leadOwner: body.leadOwner,
                assignedEmployee: body.leadOwner,
                hospital: hospitalDoc._id,
                hospitalName: body.hospitalName,
                fullAddress: body.fullAddress,
                city: body.city,
                district: body.district,
                state: body.state,
                pinCode: body.pinCode,
                branchName: body.branchName,
                contactPersonName: body.contactPersonName,
                emailAddress: body.emailAddress,
                contactNumber: body.contactNumber,
                designation: body.designation,
                advanceAmount: body.advanceAmount,
                urgency: body.urgency,
                services: serviceIds,
                additionalServices: additionalServiceIds,
                specialInstructions: body.specialInstructions,
                workOrderCopy: attachmentUrl,
                customer: customerId,
            });

            return res
                .status(201)
                .json(new ApiResponse(201, { order: newOrder }, "Direct Order created successfully (Dealer)"));
        }
        if (leadOwnerUser.role === "Manufacturer") {
            const newOrder = await orderModel.create({
                leadOwner: body.leadOwner,
                assignedEmployee: body.leadOwner,
                hospital: hospitalDoc._id,
                hospitalName: body.hospitalName,
                fullAddress: body.fullAddress,
                city: body.city,
                district: body.district,
                state: body.state,
                pinCode: body.pinCode,
                branchName: body.branchName,
                contactPersonName: body.contactPersonName,
                emailAddress: body.emailAddress,
                contactNumber: body.contactNumber,
                designation: body.designation,
                advanceAmount: body.advanceAmount,
                urgency: body.urgency,
                services: serviceIds,
                additionalServices: additionalServiceIds,
                specialInstructions: body.specialInstructions,
                workOrderCopy: attachmentUrl,
                customer: customerId,
            });

            return res
                .status(201)
                .json(new ApiResponse(201, { order: newOrder }, "Direct Order created successfully (Dealer)"));
        }
        return res.status(403).json({
            success: false,
            message: "Unauthorized role. Only Employee or Dealer can create records.",
        });
    } catch (error) {
        console.error("❌ Create Direct Order Error:", error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            const value = error.keyValue?.[field];
            return res
                .status(409)
                .json(new ApiResponse(409, null, `A record with the same ${field} (${value}) already exists.`));
        }

        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res
                .status(400)
                .json(new ApiResponse(400, null, "Validation failed", messages));
        }

        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to create direct order", [error.message]));
    }
});




const addByHospitalId = asyncHandler(async (req, res) => {
    try {
        const { hospitalId } = req.params;
        if (!hospitalId) throw new ApiError(400, "Hospital ID is required");

        // 🔍 Check if hospital exists
        const existingHospital = await Hospital.findById(hospitalId);
        if (!existingHospital) throw new ApiError(404, "Hospital not found");


        if (!req.body.customerId) {
            return res.status(400).json(
                new ApiResponse(400, null, "Customer ID is missing. Please provide a valid customerId in the request body.")
            );
        }
        let value = { ...req.body };

        // Parse JSON fields safely
        if (value.services && typeof value.services === "string") {
            try { value.services = JSON.parse(value.services); } catch { value.services = []; }
        }
        if (value.additionalServices && typeof value.additionalServices === "string") {
            try { value.additionalServices = JSON.parse(value.additionalServices); } catch { value.additionalServices = {}; }
        }

        // ✅ Attach hospital & customer
        value.hospital = hospitalId;
        value.customer = req.body.customerId;

        // ✅ Single file upload
        if (req.file) {
            const { url } = await uploadToS3(req.file);
            value.attachment = url;
        }

        // Create services
        let serviceIds = [];
        if (Array.isArray(value.services) && value.services.length > 0) {
            const transformedServices = value.services.map((s) => ({
                machineType: s.machineType,
                equipmentNo: s.equipmentNo,
                quantity: s.quantity,
                machineModel: s.machineModel,
                serialNumber: s.serialNumber || "",
                remark: s.remark || "",
                workTypeDetails: (s.workType || []).map((wt) => ({
                    workType: wt,
                    status: "pending",
                })),
            }));
            const createdServices = await Service.insertMany(transformedServices);
            serviceIds = createdServices.map((s) => s._id);
        }

        // Create additional services
        let additionalServiceIds = [];
        if (value.additionalServices && typeof value.additionalServices === "object" && Object.keys(value.additionalServices).length > 0) {
            const createdAdditionalServices = await AdditionalService.insertMany(
                Object.entries(value.additionalServices).map(([name, data]) => ({
                    name,
                    description: data.description || "",
                    totalAmount: data.totalAmount || 0,
                }))
            );
            additionalServiceIds = createdAdditionalServices.map((a) => a._id);
        }

        // Final enquiry creation
        let newEnquiry = await Enquiry.create({
            ...value,
            services: serviceIds,
            additionalServices: additionalServiceIds,
            enquiryStatusDates: { enquiredOn: new Date() },
        });

        await Hospital.findByIdAndUpdate(
            hospitalId,
            { $push: { enquiries: newEnquiry._id } },
            { new: true }
        );

        // ✅ Populate everything including customer
        newEnquiry = await Enquiry.findById(newEnquiry._id)
            .populate("services")
            .populate("additionalServices")
            .populate("hospital")
            .populate("customer");

        return res
            .status(201)
            .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
    } catch (error) {
        console.error("Create Enquiry Error:", error);
        throw new ApiError(500, "Failed to create enquiry", [error.message]);
    }
});

// const addByCustomerId = asyncHandler(async (req, res) => {
//     try {
//         const { customerId } = req.params;

//         if (!customerId) {
//             throw new ApiError(400, "Customer ID is required");
//         }

//         // ✅ Ensure customer exists
//         const existingCustomer = await User.findById(customerId);
//         if (!existingCustomer) {
//             throw new ApiError(404, "Customer not found");
//         }
//         // ✅ Normalize services
//         if (req.body.services) {
//             if (typeof req.body.services === "string") {
//                 try {
//                     req.body.services = JSON.parse(req.body.services);
//                 } catch (e) {
//                     console.error("Invalid services JSON:", req.body.services);
//                     throw new ApiError(400, "Invalid JSON format for services");
//                 }
//             }
//         } else {
//             req.body.services = []; // Prevent undefined
//         }

//         // ✅ Normalize additionalServices
//         if (req.body.additionalServices) {
//             if (typeof req.body.additionalServices === "string") {
//                 try {
//                     req.body.additionalServices = JSON.parse(req.body.additionalServices);
//                 } catch (e) {
//                     console.error("Invalid additionalServices JSON:", req.body.additionalServices);
//                     throw new ApiError(400, "Invalid JSON format for additionalServices");
//                 }
//             }
//         }
//         console.log("📥 Incoming req.body.services:", req.body.services);

//         // ✅ Validate enquiry input (except additionalServices for flexibility)
//         const { error, value } = enquirySchema.validate(req.body, {
//             abortEarly: false,
//         });

//         if (error) {
//             const errorMessages = error.details.map((err) => err.message);
//             throw new ApiError(400, "Validation failed", errorMessages);
//         }

//         // ✅ Force customer ID into payload
//         value.customer = customerId;

//         // ✅ Handle file uploads to S3
//         let attachments = [];
//         if (req.files && req.files.length > 0) {
//             const uploadPromises = req.files.map(async (file) => {
//                 const { url, key } = await uploadToS3(file);
//                 return {
//                     filename: file.originalname,
//                     key,
//                     url,
//                     mimetype: file.mimetype,
//                     size: file.size,
//                 };
//             });

//             attachments = await Promise.all(uploadPromises);
//         }

//         value.attachments = attachments;

//         // ✅ Handle additional services
//         if (req.body.additionalServices && typeof req.body.additionalServices === "object") {
//             const services = {};

//             Object.entries(req.body.additionalServices).forEach(([serviceName, serviceData]) => {
//                 // Expecting { description, amount } OR just { amount }
//                 services[serviceName] = {
//                     description: serviceData.description || "",
//                     amount: serviceData.amount ? Number(serviceData.amount) : 0,
//                 };
//             });

//             value.additionalServices = services;
//         }

//         // ✅ Create enquiry
//         const newEnquiry = await Enquiry.create(value);

//         // ✅ Link enquiry to customer
//         await User.findByIdAndUpdate(
//             customerId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );

//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry (by customerId) Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });


// const addByCustomerId = asyncHandler(async (req, res) => {
//     try {
//         const { customerId } = req.params;
//         if (!customerId) throw new ApiError(400, "Customer ID is required");

//         const existingCustomer = await User.findById(customerId);
//         if (!existingCustomer) throw new ApiError(404, "Customer not found");

//         let value = { ...req.body };

//         // parse JSON fields
//         if (value.services && typeof value.services === "string") {
//             try { value.services = JSON.parse(value.services); } catch { value.services = []; }
//         }
//         if (value.additionalServices && typeof value.additionalServices === "string") {
//             try { value.additionalServices = JSON.parse(value.additionalServices); } catch { value.additionalServices = {}; }
//         }

//         value.customer = customerId;

//         // ✅ Single file upload
//         if (req.file) {
//             const { url } = await uploadToS3(req.file);
//             value.attachment = url; // only URL stored
//         }

//         // create services
//         let serviceIds = [];
//         if (Array.isArray(value.services) && value.services.length > 0) {
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending",
//                 })),
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }

//         // create additional services
//         let additionalServiceIds = [];
//         if (value.additionalServices && typeof value.additionalServices === "object" && Object.keys(value.additionalServices).length > 0) {
//             const createdAdditionalServices = await AdditionalService.insertMany(
//                 Object.entries(value.additionalServices).map(([name, data]) => ({
//                     name,
//                     description: data.description || "",
//                     totalAmount: data.totalAmount || 0,
//                 }))
//             );
//             additionalServiceIds = createdAdditionalServices.map((a) => a._id);
//         }

//         // final enquiry
//         const newEnquiry = await Enquiry.create({
//             ...value,
//             services: serviceIds,
//             additionalServices: additionalServiceIds,
//             enquiryStatusDates: { enquiredOn: new Date() },
//         });

//         await User.findByIdAndUpdate(customerId, { $push: { enquiries: newEnquiry._id } });

//         return res.status(201).json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });


// const addByHospitalId = asyncHandler(async (req, res) => {
//     try {
//         const { hospitalId } = req.params;
//         if (!hospitalId) throw new ApiError(400, "Hospital ID is required");

//         // 🔍 Check if hospital exists
//         const existingHospital = await Hospital.findById(hospitalId);
//         if (!existingHospital) throw new ApiError(404, "Hospital not found");

//         let value = { ...req.body };

//         // Parse JSON fields safely
//         if (value.services && typeof value.services === "string") {
//             try { value.services = JSON.parse(value.services); } catch { value.services = []; }
//         }
//         if (value.additionalServices && typeof value.additionalServices === "string") {
//             try { value.additionalServices = JSON.parse(value.additionalServices); } catch { value.additionalServices = {}; }
//         }

//         // ✅ Attach hospital
//         value.hospital = hospitalId;

//         // ✅ Attach customer if passed (optional)
//         if (req.body.customerId) {
//             value.customer = req.body.customerId;
//         }

//         // ✅ Single file upload
//         if (req.file) {
//             const { url } = await uploadToS3(req.file);
//             value.attachment = url;
//         }

//         // Create services
//         let serviceIds = [];
//         if (Array.isArray(value.services) && value.services.length > 0) {
//             const transformedServices = value.services.map((s) => ({
//                 machineType: s.machineType,
//                 equipmentNo: s.equipmentNo,
//                 machineModel: s.machineModel,
//                 serialNumber: s.serialNumber || "",
//                 remark: s.remark || "",
//                 workTypeDetails: (s.workType || []).map((wt) => ({
//                     workType: wt,
//                     status: "pending",
//                 })),
//             }));
//             const createdServices = await Service.insertMany(transformedServices);
//             serviceIds = createdServices.map((s) => s._id);
//         }

//         // Create additional services
//         let additionalServiceIds = [];
//         if (value.additionalServices && typeof value.additionalServices === "object" && Object.keys(value.additionalServices).length > 0) {
//             const createdAdditionalServices = await AdditionalService.insertMany(
//                 Object.entries(value.additionalServices).map(([name, data]) => ({
//                     name,
//                     description: data.description || "",
//                     totalAmount: data.totalAmount || 0,
//                 }))
//             );
//             additionalServiceIds = createdAdditionalServices.map((a) => a._id);
//         }

//         // Final enquiry creation
//         const newEnquiry = await Enquiry.create({
//             ...value,
//             services: serviceIds,
//             additionalServices: additionalServiceIds,
//             enquiryStatusDates: { enquiredOn: new Date() },
//         });

//         // 🔗 Link enquiry to hospital
//         await Hospital.findByIdAndUpdate(
//             hospitalId,
//             { $push: { enquiries: newEnquiry._id } },
//             { new: true }
//         );

//         return res
//             .status(201)
//             .json(new ApiResponse(201, newEnquiry, "Enquiry created successfully"));
//     } catch (error) {
//         console.error("Create Enquiry Error:", error);
//         throw new ApiError(500, "Failed to create enquiry", [error.message]);
//     }
// });

const getAll = asyncHandler(async (req, res) => {
    try {
        const enquiries = await Enquiry.aggregate([
            {
                $lookup: {
                    from: "quotations",            // collection name
                    localField: "_id",
                    foreignField: "enquiry",
                    as: "quotation"
                }
            },
            {
                $project: {
                    enquiryId: 1,
                    hospitalName: 1,
                    fullAddress: 1,
                    city: 1,
                    district: 1,
                    state: 1,
                    pinCode: 1,
                    branch: 1,
                    contactPerson: 1,
                    emailAddress: 1,
                    contactNumber: 1,
                    designation: 1,
                    enquiryStatus: 1,
                    quotationStatus: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    discount: 1,
                    grandTotal: 1,
                    subtotalAmount: 1,
                    // only keep rejectionRemark from quotation
                    quotation: {
                        rejectionRemark: { $arrayElemAt: ["$quotation.rejectionRemark", 0] }
                    }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        // populates the customer info
        if (!enquiries || enquiries.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, [], "No enquiries found"));
        }
        const createdQuotations = await Quotation.find({ quotationStatus: "Created" })
            .populate("enquiry")
            .populate("from"); // Optional, if you want user info

        // Log for debugging
        // console.log("Created Quotations:", createdQuotations);
        console.log(enquiries.map(e => ({
            enquiryId: e.enquiryId,
            quotationStatus: e.quotationStatus || 'No quotation linked',
            rejectionRemark: e.rejectionRemark
        })));
        return res
            .status(200)
            .json(new ApiResponse(200, enquiries, "All enquiries fetched"));
    } catch (error) {
        console.error("Get All Enquiries Error:", error);
        throw new ApiError(500, "Failed to fetch enquiries", [error.message]);
    }
});
const getById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid ID format");
        }
        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            throw new ApiError(404, "Enquiry not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, enquiry, "Enquiry fetched successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to fetch enquiry", [error.message]);
    }
});
const deleteById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid ID format");
        }
        const deleted = await Enquiry.findByIdAndDelete(id);

        if (!deleted) {
            throw new ApiError(404, "Enquiry not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "Enquiry deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to delete enquiry", [error.message]);
    }
});
const updateById = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        const { error, value } = enquirySchema.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            const errorMessages = error.details.map((err) => err.message);
            throw new ApiError(400, "Validation failed", errorMessages);
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid ID format");
        }
        const updated = await Enquiry.findByIdAndUpdate(id, value, {
            new: true,
            runValidators: true,
        });
        if (!updated) {
            throw new ApiError(404, "Enquiry not found");
        }
        return res
            .status(200)
            .json(new ApiResponse(200, updated, "Enquiry updated successfully"));
    } catch (error) {
        throw new ApiError(500, "Failed to update enquiry", [error.message]);
    }
});

//changed
// const getEnquiryDetailsById = async (req, res) => {
//     try {
//         const enquiryId = req.params.id;
//         const enquiry = await Enquiry.findById(enquiryId)
//             .populate({
//                 path: "customer",
//                 model: "User",
//                 select: "name email phone address role",
//             })
//             .populate({
//                 path: "services",
//                 model: "Service",
//                 populate: [
//                     {
//                         path: "workTypeDetails.engineer",
//                         model: "Employee",
//                         select: "name email phone technicianType",
//                     },
//                     {
//                         path: "workTypeDetails.officeStaff",
//                         model: "Employee",
//                         select: "name email phone technicianType",
//                     },
//                 ],
//             })
//             // ✅ Populate additional services
//             .populate({
//                 path: "additionalServices",
//                 model: "AdditionalService",
//                 select: "additionalServices name description createdAt updatedAt",
//             });
//         console.log("🚀 ~ getEnquiryDetailsById ~ enquiry:", enquiry)

//         if (!enquiry) {
//             return res.status(404).json({ message: "Enquiry not found" });
//         }

//         return res.status(200).json({
//             enquiryId: enquiry.enquiryId,
//             hospitalName: enquiry.hospitalName,
//             fullAddress: enquiry.fullAddress,
//             city: enquiry.city,
//             state: enquiry.state,
//             pinCode: enquiry.pinCode,
//             designation: enquiry.designation,
//             customer: enquiry.customer,
//             services: enquiry.services,
//             additionalServices: enquiry.additionalServices, // ✅ populated data
//             specialInstructions: enquiry.specialInstructions,
//             attachment: enquiry.attachment,
//             enquiryStatus: enquiry.enquiryStatus,
//             enquiryStatusDates: enquiry.enquiryStatusDates,
//             quotationStatus: enquiry.quotationStatus,
//             createdAt: enquiry.createdAt,
//             specialInstructions: enquiry.specialInstructions
//         });
//     } catch (err) {
//         console.error("Error fetching enquiry details:", err);
//         return res.status(500).json({ message: "Server error" });
//     }
// };

const getEnquiryDetailsById = async (req, res) => {
    try {
        const enquiryId = req.params.id;

        const enquiry = await Enquiry.findById(enquiryId)
            .populate({
                path: "customer",
                model: "User",
                select: "name email phone address role",
            })
            .populate({
                path: "services",
                model: "Service",
                populate: [
                    {
                        path: "workTypeDetails.engineer",
                        model: "Employee",
                        select: "name email phone technicianType",
                    },
                    {
                        path: "workTypeDetails.QAtest",
                        model: "QATest",
                        populate: {
                            path: "officeStaff",
                            model: "Employee",
                            select: "name email phone technicianType",
                        },
                    },
                    {
                        path: "workTypeDetails.elora",
                        model: "Elora",
                        populate: {
                            path: "officeStaff",
                            model: "Employee",
                            select: "name email phone technicianType",
                        },
                    },
                ],
            })
            .populate({
                path: "additionalServices",
                model: "AdditionalService",
                select: "additionalServices name description createdAt updatedAt",
            });

        if (!enquiry) {
            return res.status(404).json({ message: "Enquiry not found" });
        }

        let attachmentSignedUrl = null;
        if (enquiry.attachment) {
            const urlParts = enquiry.attachment.split(".com/");
            const key = urlParts[1];

            if (key) {
                attachmentSignedUrl = await getS3SignedUrl(key);
            } else {
                console.warn("Invalid attachment URL format:", enquiry.attachment);
            }
        }

        return res.status(200).json({
            enquiryId: enquiry.enquiryId,
            hospitalName: enquiry.hospitalName,
            fullAddress: enquiry.fullAddress,
            city: enquiry.city,
            state: enquiry.state,
            pinCode: enquiry.pinCode,
            designation: enquiry.designation,
            customer: enquiry.customer,
            services: enquiry.services,
            contactPerson: enquiry.contactPerson,
            contactNumber: enquiry.contactNumber,
            emailAddress: enquiry.emailAddress,
            additionalServices: enquiry.additionalServices,
            specialInstructions: enquiry.specialInstructions,
            attachment: enquiry.attachment, // return original stored string
            signedUrl: attachmentSignedUrl, // optional signed download link
            enquiryStatus: enquiry.enquiryStatus,
            enquiryStatusDates: enquiry.enquiryStatusDates,
            quotationStatus: enquiry.quotationStatus,
            createdAt: enquiry.createdAt,
        });
    } catch (err) {
        console.error("Error fetching enquiry details:", err);
        return res.status(500).json({ message: "Server error" });
    }
};


// const getByCustomerIdEnquiryId = async (req, res) => {
//     try {
//         const { id: enquiryId, customerId } = req.params; // both enquiryId & customerId from params

//         if (!enquiryId || !customerId) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Enquiry ID and Customer ID are required'
//             });
//         }

//         const enquiry = await Enquiry.findOne({
//             _id: enquiryId,
//             customer: customerId
//         }).populate({
//             path: 'customer',
//             model: 'User', // or 'Customer' depending on your schema
//             select: 'name email phone address role'
//         });

//         if (!enquiry) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Enquiry not found for this customer'
//             });
//         }

//         const additionalServices = enquiry.additionalServices || {};

//         return res.status(200).json({
//             success: true,
//             enquiryId: enquiry.enquiryId,
//             hospitalName: enquiry.hospitalName,
//             customer: enquiry.customer,
//             machines: enquiry.services, // includes machineType, equipmentNo, etc.
//             additionalServices,
//         });
//     } catch (err) {
//         console.error('Error fetching enquiry details:', err);
//         return res.status(500).json({
//             success: false,
//             message: err?.message || 'Server error'
//         });
//     }
// };
//changed
// const getByCustomerIdEnquiryId = async (req, res) => {
//     try {
//         const { id: enquiryId, customerId } = req.params; // both enquiryId & customerId from params

//         if (!enquiryId || !customerId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Enquiry ID and Customer ID are required"
//             });
//         }

//         const enquiry = await Enquiry.findOne({
//             _id: enquiryId,
//             customer: customerId
//         }).populate({
//             path: "customer",
//             model: "User", // or 'Customer' depending on your schema
//             select: "name email phone address role"
//         });

//         if (!enquiry) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Enquiry not found for this customer"
//             });
//         }

//         // Convert Mongoose Map to plain JS object
//         const additionalServices = enquiry.additionalServices
//             ? Object.fromEntries(enquiry.additionalServices)
//             : {};

//         return res.status(200).json({
//             success: true,
//             enquiryId: enquiry.enquiryId,
//             hospitalName: enquiry.hospitalName,
//             customer: enquiry.customer,
//             machines: enquiry.services, // includes machineType, equipmentNo, etc.
//             additionalServices
//         });
//     } catch (err) {
//         console.error("Error fetching enquiry details:", err);
//         return res.status(500).json({
//             success: false,
//             message: err?.message || "Server error"
//         });
//     }
// };




// const getByHospitalIdEnquiryId = async (req, res) => {
//     try {
//         const { enquiryId, hospitalId } = req.params;

//         if (!enquiryId || !hospitalId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Enquiry ID and Hospital ID are required"
//             });
//         }

//         const enquiry = await Enquiry.findOne({
//             _id: enquiryId,
//             hospital: hospitalId
//         })
//             .populate({
//                 path: "hospital",
//                 model: "Hospital",
//                 select: "name email address phone gstNo branch"
//             })
//             .populate({
//                 path: "services",
//                 model: "Service",
//                 select: "machineType equipmentNo machineModel serialNumber remark workTypeDetails"
//             })
//             .populate({
//                 path: "additionalServices",
//                 model: "AdditionalService",
//                 select: "name description totalAmount"
//             });

//         if (!enquiry) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Enquiry not found for this hospital"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             enquiryId: enquiry.enquiryId,
//             hospitalName: enquiry.hospitalName,
//             hospital: enquiry.hospital,
//             services: enquiry.services, // now populated with full details
//             additionalServices: enquiry.additionalServices,
//             specialInstructions: enquiry.specialInstructions,
//             enquiryStatus: enquiry.enquiryStatus,
//             enquiryStatusDates: enquiry.enquiryStatusDates,
//         });
//     } catch (err) {
//         console.error("Error fetching enquiry details:", err);
//         return res.status(500).json({
//             success: false,
//             message: err?.message || "Server error"
//         });
//     }
// };
const getByHospitalIdEnquiryId = async (req, res) => {
    try {
        const { enquiryId, hospitalId } = req.params;

        if (!enquiryId || !hospitalId) {
            return res.status(400).json({
                success: false,
                message: "Enquiry ID and Hospital ID are required",
            });
        }

        const enquiry = await Enquiry.findOne({
            _id: enquiryId,
            hospital: hospitalId,
        })
            .populate({
                path: "hospital",
                model: "Hospital",
                select: "name email address phone gstNo branch",
            })
            .populate({
                path: "services",
                model: "Service",
                select:
                    "machineType equipmentNo machineModel quantity serialNumber remark workTypeDetails",
            })
            .populate({
                path: "additionalServices",
                model: "AdditionalService",
                select: "name description totalAmount",
            });
        console.log("🚀 ~ getByHospitalIdEnquiryId ~ enquiry:", enquiry)

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found for this hospital",
            });
        }

        return res.status(200).json({
            success: true,
            enquiryId: enquiry.enquiryId,

            // 🔹 Hospital info (from enquiry itself)
            hospitalName: enquiry.hospitalName,
            fullAddress: enquiry.fullAddress,
            city: enquiry.city,
            district: enquiry.district,
            state: enquiry.state,
            pinCode: enquiry.pinCode,
            branch: enquiry.branch,
            contactPerson: enquiry.contactPerson,
            emailAddress: enquiry.emailAddress,
            contactNumber: enquiry.contactNumber,
            designation: enquiry.designation,
            attachment: enquiry.attachment,
            // 🔹 Hospital reference (populated)
            hospital: enquiry.hospital,

            // 🔹 Linked services & additional services
            services: enquiry.services,
            additionalServices: enquiry.additionalServices,

            // 🔹 Extra details
            specialInstructions: enquiry.specialInstructions,
            enquiryStatus: enquiry.enquiryStatus,
            enquiryStatusDates: enquiry.enquiryStatusDates,
            quotationStatus: enquiry.quotationStatus,
            subtotalAmount: enquiry.subtotalAmount,
            discount: enquiry.discount,
            grandTotal: enquiry.grandTotal,
        });
    } catch (err) {
        console.error("Error fetching enquiry details:", err);
        return res.status(500).json({
            success: false,
            message: err?.message || "Server error",
        });
    }
};




const getAllEnquiriesByHospitalId = asyncHandler(async (req, res) => {
    try {
        const { hospitalId } = req.params;
        console.log("🚀 ~ hospitalId:", hospitalId);

        if (!hospitalId) {
            throw new ApiError(400, "Hospital ID is required");
        }

        const enquiries = await Enquiry.find({ hospital: hospitalId })
            .populate("hospital", "name email address")
            .populate("services", "machineType equipmentNo machineModel serialNumber totalAmount status")
            .populate("additionalServices", "name")
            .populate("customer", "name email contactNumber") // <-- populate customer
            .sort({ createdAt: -1 });


        console.log("🚀 ~ enquiries:", enquiries)

        if (!enquiries || enquiries.length === 0) {
            throw new ApiError(404, "No enquiries found for this hospital");
        }

        res.status(200).json(
            new ApiResponse(200, enquiries, "Enquiries fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, error?.message || "Internal Server Error");
    }
});


const getAllStates = asyncHandler(async (req, res) => {
    try {
        const states = [
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
            "Delhi",
            "Jammu and Kashmir",
            "Ladakh",
            "Puducherry",
            "Chandigarh",
            "Andaman and Nicobar Islands",
            "Lakshadweep",
            "Dadra and Nagar Haveli and Daman and Diu"
        ];
        return res.status(200).json(new ApiResponse(200, states, "success"))
    } catch (error) {
        console.log("error", error);
    }
})

const getStaffEnquiries = asyncHandler(async (req, res) => {
    try {
        // ✅ Ensure user info is available
        const userId = req.user?._id || req.user?.id;
        if (!userId) {
            return res.status(401).json(
                new ApiResponse(401, null, "Unauthorized: User not found in request.")
            );
        }

        // ✅ Fetch all enquiries created by this staff
        const enquiries = await Enquiry.find({ createdBy: userId })
            .populate("hospital", "name address branch") // optional: populate related fields
            .populate("customer", "name email phone")
            .populate("services") // if needed
            .populate("additionalServices") // if needed
            .sort({ createdAt: -1 }); // latest first

        // ✅ If none found
        if (!enquiries.length) {
            return res
                .status(404)
                .json(new ApiResponse(404, [], "No enquiries found for this staff."));
        }

        // ✅ Success response
        return res
            .status(200)
            .json(new ApiResponse(200, enquiries, "Enquiries fetched successfully."));
    } catch (error) {
        console.error("❌ Error fetching staff enquiries:", error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to fetch staff enquiries", [error.message]));
    }
});

export default { add, getById, deleteById, updateById, getAll, getEnquiryDetailsById, addByHospitalId, getByHospitalIdEnquiryId, createDirectOrder, getAllStates, getAllEnquiriesByHospitalId, getStaffEnquiries };