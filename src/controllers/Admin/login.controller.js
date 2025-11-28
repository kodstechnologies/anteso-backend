import Admin from "../../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema } from "../../validators/adminValidators.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import Employee from "../../models/technician.model.js";
import Attendance from '../../models/attendanceSchema.model.js'
import Leave from "../../models/leave.model.js";
import Joi from "joi";
import sendSMS from "../../utils/SendSMS.js";
import LoginOtp from "../../models/otpLogins.model.js";
import { LeaveAllocation } from "../../models/allocateLeaves.model.js"
import User from "../../models/user.model.js";
import Client from "../../models/client.model.js";
import Hospital from "../../models/hospital.model.js";
import Enquiry from "../../models/enquiry.model.js";
import Services from "../../models/Services.js";
import { enquirySchema } from "../../validators/enquiryValidators.js";
import AdditionalService from "../../models/additionalService.model.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_USER_SECRET = process.env.JWT_USER_SECRET;

// const adminLogin = asyncHandler(async (req, res) => {
//     // 1. Validate input
//     const { error, value } = loginSchema.validate(req.body);
//     if (error) {
//         throw new ApiError(400, error.details[0].message);
//     }
//     const { email, password } = value;
//     // 2. Find admin by email
//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//         throw new ApiError(404, "Admin not found");
//     }
//     // 3. Compare password
//     const isPasswordValid = await bcrypt.compare(password, admin.password);
//     if (!isPasswordValid) {
//         throw new ApiError(401, "Invalid email or password");
//     }
//     // 4. Generate tokens
//     const accessToken = jwt.sign(
//         { id: admin._id, email: admin.email, role: admin.role }, // <-- include role
//         process.env.JWT_SECRET,
//         { expiresIn: "360d" }
//     );
//     const refreshToken = jwt.sign(
//         { id: admin._id },
//         process.env.JWT_REFRESH_SECRET,
//         { expiresIn: "365d" }
//     );
//     res.status(200).json(
//         new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
//     );
// });



//  const adminLogin = asyncHandler(async (req, res) => {
//     // 1. Validate input
//     const { error, value } = loginSchema.validate(req.body);
//     if (error) {
//         throw new ApiError(400, error.details[0].message);
//     }
//     const { email, password } = value;

//     // 2. Try Admin login first
//     const admin = await Admin.findOne({ email });
//     if (admin) {
//         const isPasswordValid = await bcrypt.compare(password, admin.password);
//         if (!isPasswordValid) {
//             throw new ApiError(401, "Invalid email or password");
//         }

//         const accessToken = jwt.sign(
//             { id: admin._id, email: admin.email, role: 'admin' },
//             process.env.JWT_SECRET,
//             { expiresIn: '360d' }
//         );
//         const refreshToken = jwt.sign(
//             { id: admin._id },
//             process.env.JWT_REFRESH_SECRET,
//             { expiresIn: '365d' }
//         );

//         return res.status(200).json(
//             new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
//         );
//     }

//     // 3. Check Employee (office-staff only)
//     const employee = await Employee.findOne({ email, status: 'active', technicianType: 'office-staff' });
//     if (employee) {
//         const isPasswordValid = await bcrypt.compare(password, employee.password);
//         if (!isPasswordValid) {
//             throw new ApiError(401, "Invalid email or password");
//         }

//         const accessToken = jwt.sign(
//             { id: employee._id, email: employee.email, role: 'staff' },
//             process.env.JWT_SECRET,
//             { expiresIn: '360d' }
//         );
//         const refreshToken = jwt.sign(
//             { id: employee._id },
//             process.env.JWT_REFRESH_SECRET,
//             { expiresIn: '365d' }
//         );

//         return res.status(200).json(
//             new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
//         );
//     }

//     // 4. If neither admin nor active staff
//     throw new ApiError(401, "Invalid email or password");
// });




// const adminLogin = asyncHandler(async (req, res) => {
//     // 1. Validate input
//     const { error, value } = loginSchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const { email, password } = value;

//     // 2. Try Admin login first
//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//         console.log("Admin not found for email:", email);
//     } else {
//         console.log("Stored hash:", admin.password);
//         const isPasswordValid = await bcrypt.compare(password, admin.password);
//         console.log("Password valid?", isPasswordValid);
//         if (!isPasswordValid) console.log("Password mismatch!");
//     }
//     if (admin) {
//         const isPasswordValid = await bcrypt.compare(password, admin.password);
//         if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

//         const accessToken = jwt.sign(
//             { id: admin._id, email: admin.email, role: 'admin' },
//             process.env.JWT_SECRET,
//             { expiresIn: '360d' }
//         );
//         const refreshToken = jwt.sign(
//             { id: admin._id },
//             process.env.JWT_REFRESH_SECRET,
//             { expiresIn: '365d' }
//         );

//         return res.status(200).json(
//             new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
//         );
//     }

//     // 3. Check Employee (office-staff only)
//     const employee = await Employee.findOne({ email, status: 'active', technicianType: 'office-staff' });
//     if (employee) {
//         const isPasswordValid = await bcrypt.compare(password, employee.password);
//         if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

//         const accessToken = jwt.sign(
//             { id: employee._id, email: employee.email, role: 'staff' },
//             process.env.JWT_SECRET,
//             { expiresIn: '360d' }
//         );
//         const refreshToken = jwt.sign(
//             { id: employee._id },
//             process.env.JWT_REFRESH_SECRET,
//             { expiresIn: '365d' }
//         );

//         // ✅ Check if employee is on approved leave today
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         const leaveToday = await Leave.findOne({
//             employee: employee._id,
//             status: 'Approved',
//             startDate: { $lte: today },
//             endDate: { $gte: today },
//         });

//         if (leaveToday) {
//             console.log("Employee is on approved leave today, skipping attendance update.");

//             // Optional: ensure attendance shows "On Leave" for today
//             await Attendance.findOneAndUpdate(
//                 { employee: employee._id, date: today },
//                 { employee: employee._id, date: today, status: 'On Leave', leave: leaveToday._id },
//                 { upsert: true, new: true }
//             );
//         } else {
//             // ✅ Mark staff as present if not on leave
//             await Attendance.findOneAndUpdate(
//                 { employee: employee._id, date: today },
//                 { employee: employee._id, date: today, status: 'Present' },
//                 { upsert: true, new: true }
//             );
//         }

//         return res.status(200).json(
//             new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
//         );
//     }


//     // 4. If neither admin nor active staff
//     throw new ApiError(401, "Invalid email or password");
// });



const adminLogin = asyncHandler(async (req, res) => {
    // 1. Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { email, password } = value;

    // 2. Try Admin login first
    const admin = await Admin.findOne({ email });

    if (admin) {
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

        const accessToken = jwt.sign(
            { id: admin._id, email: admin.email, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "360d" }
        );

        const refreshToken = jwt.sign(
            { id: admin._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "365d" }
        );

        return res.status(200).json(
            new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
        );
    }

    // 3. Email-password login for Office Staff only
    const employee = await Employee.findOne({
        email,
        status: "active",
        technicianType: "office-staff",
    });

    if (employee) {
        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

        const accessToken = jwt.sign(
            { id: employee._id, email: employee.email, role: "staff" },
            process.env.JWT_SECRET,
            { expiresIn: "360d" }
        );

        const refreshToken = jwt.sign(
            { id: employee._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "365d" }
        );

        // -------------------------
        // ✅ ATTENDANCE + COMP-OFF
        // -------------------------
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if staff is on approved leave
        const leaveToday = await Leave.findOne({
            employee: employee._id,
            status: "Approved",
            startDate: { $lte: today },
            endDate: { $gte: today },
        });

        let attendanceStatus = "Present";

        if (leaveToday) {
            attendanceStatus = "On Leave";

            await Attendance.findOneAndUpdate(
                { employee: employee._id, date: today },
                {
                    employee: employee._id,
                    date: today,
                    status: "On Leave",
                    leave: leaveToday._id
                },
                { upsert: true, new: true }
            );
        } else {
            // Mark present
            await Attendance.findOneAndUpdate(
                { employee: employee._id, date: today },
                {
                    employee: employee._id,
                    date: today,
                    status: "Present"
                },
                { upsert: true, new: true }
            );
        }

        // ⭐⭐⭐ COMP-OFF LOGIC FOR STAFF (SATURDAY + SUNDAY) ⭐⭐⭐
        const todayDay = today.getDay();   // 0 = Sunday, 6 = Saturday
        const todayIsHoliday = todayDay === 0 || todayDay === 6;

        if (todayIsHoliday && attendanceStatus === "Present") {
            console.log("🎉 Staff worked on weekend (Sat/Sun)! Adding comp-off...");

            const currentYear = new Date().getFullYear();

            let allocation = await LeaveAllocation.findOne({
                employee: employee._id,
                year: currentYear,
            });

            if (allocation) {
                allocation.totalLeaves += 1;
                await allocation.save();
            } else {
                await LeaveAllocation.create({
                    employee: employee._id,
                    year: currentYear,
                    totalLeaves: 1,
                    usedLeaves: 0,
                });
            }
        }

        // -------------------------

        return res.status(200).json(
            new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
        );
    }

    // 4. Neither admin nor staff
    throw new ApiError(401, "Invalid email or password");
});



const staffLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // 1️⃣ Find employee by email
    const staff = await Employee.findOne({ email });
    if (!staff) {
        throw new ApiError(404, "Staff not found");
    }

    // 2️⃣ Check status (must be active)
    if (staff.status !== "active") {
        throw new ApiError(403, "Staff account is inactive. Contact admin.");
    }

    // 3️⃣ Compare password (direct compare)
    if (staff.password !== password) {
        throw new ApiError(401, "Invalid email or password");
    }

    // 4️⃣ Generate tokens
    const accessToken = jwt.sign(
        { id: staff._id, email: staff.email, role: "office-staff" },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign(
        { id: staff._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    res.status(200).json(
        new ApiResponse(
            200,
            { accessToken, refreshToken, staffId: staff._id, empId: staff.empId },
            "Staff login successful"
        )
    );
});



const signOut = asyncHandler(async (req, res) => {
    try {
        // If you were storing tokens as HTTP-only cookies from backend, clear them here:
        res.clearCookie('accessToken', { httpOnly: true, secure: true, sameSite: 'strict' });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'strict' });

        // Send success response
        return res.status(200).json(
            new ApiResponse(200, {}, "Logout successful")
        );
    } catch (error) {
        throw new ApiError(500, "Error during signout");
    }
});


const sendOtpForStaff = asyncHandler(async (req, res) => {
    const schema = Joi.object({
        mobileNumber: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { mobileNumber } = req.body;

    // 🔍 Allow only Admin + Office Staff
    const [admin, staff] = await Promise.all([
        Admin.findOne({
            phoneNumber: mobileNumber,
            role: { $in: ["admin", "office-staff"] },
        }),
        Employee.findOne({
            phone: mobileNumber,
            technicianType: "office-staff",
            status: "active",
        })
    ]);

    const existing = admin || staff;

    if (!existing) {
        return res.status(403).json({
            success: false,
            message: "Access denied! Only admins or office staff are allowed.",
        });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const message = `Dear User, Your OTP for login is ${otp}. It is valid for 10 minutes. Please do not share this OTP with anyone. - ANTESO BIOMEDICAL`;

    try {
        await sendSMS(mobileNumber, message);

        await LoginOtp.findOneAndUpdate(
            { mobileNumber },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (err) {
        console.error("Error sending Admin OTP:", err);
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
});

const verifyOtpForStaff = asyncHandler(async (req, res) => {
    const schema = Joi.object({
        mobileNumber: Joi.string().required(),
        otp: Joi.string().length(6).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { mobileNumber, otp } = req.body;

    const isStaticOtp = otp === "555555";

    // 🔍 Validate OTP
    if (!isStaticOtp) {
        const record = await LoginOtp.findOne({ mobileNumber });
        if (!record)
            return res.status(400).json({ success: false, message: "No OTP sent to this number" });

        if (record.expiresAt < new Date())
            return res.status(400).json({ success: false, message: "OTP expired" });

        if (record.otp !== otp)
            return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // 🔍 Check only Admin + Office Staff
    let user = await Admin.findOne({
        phoneNumber: mobileNumber,
        role: { $in: ["admin", "office-staff"] }
    });

    let isAdmin = true;

    if (!user) {
        user = await Employee.findOne({
            phone: mobileNumber,
            technicianType: "office-staff",
            status: "active"
        });

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Only Admin or Office Staff can login here.",
            });
        }

        isAdmin = false;
    }

    // Delete OTP after use (except static OTP)
    if (!isStaticOtp) {
        await LoginOtp.deleteOne({ mobileNumber });
    }

    // ✅ SUCCESS — Do NOT generate token
    return res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        user: {
            _id: user._id,
            name: user.name,
            phone: mobileNumber,
            role: user.role || "office-staff",
            isAdmin,
        }
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    try {
        let { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ message: "Phone and password are required" });
        }

        phone = phone.toString().trim();
        console.log("🔍 Incoming reset request for phone:", phone);

        // 1️⃣ Try Admin first (phoneNumber is stored as String)
        let account = await Admin.findOne({ phoneNumber: phone });
        let accountType = "Admin";

        // 2️⃣ If not found, try Employee (phone stored as Number)
        if (!account) {
            account = await Employee.findOne({
                phone: Number(phone),
                technicianType: "office-staff",
                status: "active"
            });
            accountType = "Office Staff";
        }

        // 3️⃣ If no match, return error
        if (!account) {
            return res.status(404).json({ message: "No Admin or active Office Staff found for this phone" });
        }

        console.log(`✅ Found ${accountType}:`, account.email || account.phone);

        // 4️⃣ Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("🔑 New Hash Generated:", hashedPassword);

        account.password = hashedPassword;
        await account.save();

        console.log(`💾 ${accountType} Password Updated Successfully`);

        res.status(200).json({
            success: true,
            message: `${accountType} password reset successful`,
        });
    } catch (error) {
        console.error("🚨 resetPassword error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
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
            const createdServices = await Services.insertMany(transformedServices);
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

export default { adminLogin, staffLogin, sendOtpForStaff, verifyOtpForStaff, resetPassword, getAllStates,add }
