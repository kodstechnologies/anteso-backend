import Joi from "joi";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import LoginOtp from "../../models/otpLogins.model.js";
import sendSMS from "../../utils/SendSMS.js";
import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import Employee from "../../models/technician.model.js";
import Attendance from "../../models/attendanceSchema.model.js";
import Leave from "../../models/leave.model.js";
import bcrypt from "bcryptjs";
import Admin from "../../models/admin.model.js";

const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

//otp functions using sendsms function

// ================== SEND OTP ==================
// export const sendOtp = asyncHandler(async (req, res) => {
//     const mobileVerifySchema = Joi.object({
//         mobileNumber: Joi.string().required(),
//     });

//     const { error } = mobileVerifySchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const { mobileNumber } = req.body;
//      const existingUser = await User.findOne({ phone: mobileNumber, role: "Customer" });
//     console.log("🚀 ~ existingUser:", existingUser)
//     if (!existingUser) {
//         throw new ApiError(404, "Mobile number not registered! Please contact admin.");
//     }

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     console.log("🚀 ~ sendOtp ~ otp:", otp)
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     const message = `Dear User, Your OTP for login is ${otp}. It is valid for 10 minutes. Please do not share this OTP with anyone. - ANTESO BIOMEDICAL`;

//     try {
//         await sendSMS(mobileNumber, message);
//         await LoginOtp.findOneAndUpdate(
//             { mobileNumber },
//             { otp, expiresAt },
//             { upsert: true, new: true }
//         );

//         return res.status(200).json(
//             new ApiResponse(200, null, "OTP sent successfully")
//         );
//     } catch (err) {
//         console.error("Error sending OTP:", err);
//         throw new ApiError(500, "Failed to send OTP", [err.message]);
//     }
// });



// export const sendOtp = asyncHandler(async (req, res) => {
//     const mobileVerifySchema = Joi.object({
//         mobileNumber: Joi.string().required(),
//     });

//     const { error } = mobileVerifySchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const { mobileNumber } = req.body;

//     // Check for customer OR engineer employee
//     const existingUser = await User.findOne({
//         phone: mobileNumber,
//         $or: [
//             { role: "Customer" },
//             { role: "Employee", technicianType: "engineer", status: "active" }
//         ]
//     });

//     console.log("🚀 ~ existingUser:", existingUser);

//     if (!existingUser) {
//         return res.status(404).json({
//             success: false,
//             message: "Mobile number not registered!"
//         });
//     }


//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     console.log("🚀 ~ otp:", otp)
//     console.log("🚀 ~ sendOtp ~ otp:", otp);
//     const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

//     const message = `Dear User, Your OTP for login is ${otp}. It is valid for 10 minutes. Please do not share this OTP with anyone. - ANTESO BIOMEDICAL`;

//     try {
//         await sendSMS(mobileNumber, message);

//         await LoginOtp.findOneAndUpdate(
//             { mobileNumber },
//             { otp, expiresAt },
//             { upsert: true, new: true }
//         );

//         return res.status(200).json(
//             new ApiResponse(200, null, "OTP sent successfully")
//         );
//     } catch (err) {
//         console.error("Error sending OTP:", err);
//         throw new ApiError(500, "Failed to send OTP", [err.message]);
//     }
// });


export const sendOtp = asyncHandler(async (req, res) => {
    const mobileVerifySchema = Joi.object({
        mobileNumber: Joi.string().required(),
    });

    const { error } = mobileVerifySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    const { mobileNumber } = req.body;
    console.log("🚀 ~ mobileNumber:", mobileNumber)

    // 🔍 Find matching user or admin
    const [user, admin] = await Promise.all([
        User.findOne({
            phone: mobileNumber,
            $or: [
                { role: "Customer" },
                { role: "Manufacturer" },
                { role: "Dealer" },
                { role: "Employee", technicianType: "engineer", status: "active" },
                // { role: "Employee", technicianType: "office-staff", status: "active" } // ✅ Added office-staff
                { role: "Employee", technicianType: "office-staff", status: "active" },
            ]
        }),
        Admin.findOne({ phoneNumber: mobileNumber })
    ]);

    const existingUser = user || admin;
    console.log("🚀 ~ existingUser:", existingUser)

    if (!existingUser) {
        return res.status(404).json({
            success: false,
            message: "Mobile number not registered!"
        });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🚀 ~ otp:", otp)
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
            message: "OTP sent successfully"
        });
    } catch (err) {
        console.error("Error sending OTP:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: err.message
        });
    }
});





//for playstore testing
// export const verifyOtp = asyncHandler(async (req, res) => {
//     // ✅ Validate OTP input
//     const verifyOtpSchema = Joi.object({
//         mobileNumber: Joi.string().required(),
//         otp: Joi.string().length(6).required(),
//     });

//     const { error } = verifyOtpSchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const { mobileNumber, otp } = req.body;

//     // ✅ Allow static OTP (e.g. 555555) only in test mode or for Play Store testing
//     const isStaticOtp = otp === "555555";

//     // ✅ Fetch OTP record only if not using static OTP
//     let otpRecord = null;
//     if (!isStaticOtp) {
//         otpRecord = await LoginOtp.findOne({ mobileNumber });

//         if (!otpRecord) throw new ApiError(400, "No OTP sent to this number");
//         if (otpRecord.expiresAt < new Date()) throw new ApiError(400, "OTP has expired");
//         if (otpRecord.otp !== otp) throw new ApiError(400, "Invalid OTP");
//     }

//     // ✅ Find user (Customer or Engineer Employee)
//     let user = await User.findOne({ phone: mobileNumber, role: "Customer" });

//     if (!user) {
//         user = await User.findOne({ phone: mobileNumber, role: "Employee" });
//         if (!user) throw new ApiError(404, "User not found or not allowed");

//         // Only engineers are allowed
//         const employee = await Employee.findOne({ _id: user._id, technicianType: "engineer" });
//         if (!employee) throw new ApiError(403, "Only engineers are allowed");

//         // ✅ Mark attendance
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);

//         let attendance = await Attendance.findOne({ employee: user._id, date: today });

//         if (!attendance) {
//             const leave = await Leave.findOne({
//                 employee: user._id,
//                 startDate: { $lte: today },
//                 endDate: { $gte: today },
//                 status: "Approved",
//             });

//             attendance = new Attendance({
//                 employee: user._id,
//                 date: today,
//                 status: leave ? "Absent" : "Present",
//                 workingDays: employee.workingDays,
//                 leave: leave ? leave._id : null,
//             });

//             await attendance.save();
//         }
//     }

//     // ✅ Generate tokens
//     const payload = {
//         _id: user._id,
//         role: user.role,
//         phone: user.phone,
//     };

//     const token = jwt.sign(payload, JWT_USER_SECRET, { expiresIn: "360d" });
//     const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "365d" });

//     // ✅ Set cookie
//     res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     // ✅ Delete OTP record if it was a real one
//     if (!isStaticOtp) {
//         await LoginOtp.deleteOne({ mobileNumber });
//     }

//     // ✅ Response
//     return res
//         .status(200)
//         .json(new ApiResponse(200, { token, user, refreshToken }, "OTP verified successfully"));
// });


// export const verifyOtp = asyncHandler(async (req, res) => {
//     const verifyOtpSchema = Joi.object({
//         mobileNumber: Joi.string().required(),
//         otp: Joi.string().length(6).required(),
//     });

//     const { error } = verifyOtpSchema.validate(req.body);
//     if (error) {
//         return res.status(400).json({
//             success: false,
//             message: error.details[0].message
//         });
//     }

//     const { mobileNumber, otp } = req.body;

//     const isStaticOtp = otp === "555555";

//     if (!isStaticOtp) {
//         const otpRecord = await LoginOtp.findOne({ mobileNumber });
//         if (!otpRecord) return res.status(400).json({ success: false, message: "No OTP sent to this number" });
//         if (otpRecord.expiresAt < new Date()) return res.status(400).json({ success: false, message: "OTP has expired" });
//         if (otpRecord.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
//     }

//     // 🔍 Check for User (including both engineer + office staff)
//     let user = await User.findOne({
//         phone: mobileNumber,
//         $or: [
//             { role: "Customer" },
//             { role: "Manufacturer" },
//             { role: "Dealer" },
//             { role: "Employee", technicianType: "engineer", status: "active" },
//             { role: "Employee", technicianType: "office-staff", status: "active" } // ✅ Added office-staff
//         ]
//     });

//     let isAdmin = false;

//     if (!user) {
//         user = await Admin.findOne({ phoneNumber: mobileNumber });
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User/Admin not found or not allowed"
//             });
//         }
//         isAdmin = true;
//     }

//     // 🕒 Optional: Engineer attendance mark
//     // if (!isAdmin && user.role === "Employee" && user.technicianType === "engineer") {
//     //     const employee = await Employee.findOne({ _id: user._id, technicianType: "engineer" });
//     //     if (employee) {
//     //         const today = new Date();
//     //         console.log("🚀 ~ today:--------->", today)
//     //         today.setHours(0, 0, 0, 0);

//     //         let attendance = await Attendance.findOne({ employee: user._id, date: today });
//     //         console.log("🚀 ~ attendance:", attendance)

//     //         if (!attendance) {
//     //             const leave = await Leave.findOne({
//     //                 employee: user._id,
//     //                 startDate: { $lte: today },
//     //                 endDate: { $gte: today },
//     //                 status: "Approved",
//     //             });

//     //             attendance = new Attendance({
//     //                 employee: user._id,
//     //                 date: today,
//     //                 status: leave ? "Absent" : "Present",
//     //                 workingDays: employee.workingDays,
//     //                 leave: leave ? leave._id : null,
//     //             });

//     //             await attendance.save();
//     //         }
//     //     }
//     // }
//     // 🕒 Optional: Engineer attendance mark
//     if (!isAdmin && user.role === "Employee" && user.technicianType === "engineer") {
//         const employee = await Employee.findOne({ _id: user._id, technicianType: "engineer" });

//         if (employee) {
//             const now = new Date();

//             // Get local midnight and add timezone offset to get correct UTC midnight
//             const todayStartLocal = new Date(now);
//             todayStartLocal.setHours(0, 0, 0, 0);

//             const todayEndLocal = new Date(now);
//             todayEndLocal.setHours(23, 59, 59, 999);

//             // ✅ Convert local (IST) → UTC by subtracting offset
//             const offsetMs = todayStartLocal.getTimezoneOffset() * 60 * 1000; // -330 min for IST
//             const todayStartUTC = new Date(todayStartLocal.getTime() - offsetMs);
//             const todayEndUTC = new Date(todayEndLocal.getTime() - offsetMs);

//             console.log("📅 Local Start:", todayStartLocal);
//             console.log("🌍 Corrected UTC Start:", todayStartUTC);
//             console.log("🌍 Corrected UTC End:", todayEndUTC);

//             // 🔍 Check if attendance already exists
//             let attendance = await Attendance.findOne({
//                 employee: user._id,
//                 date: { $gte: todayStartUTC, $lte: todayEndUTC }
//             });

//             if (!attendance) {
//                 // 🔎 Check if leave is approved for this day
//                 const leave = await Leave.findOne({
//                     employee: user._id,
//                     status: "Approved",
//                     startDate: { $lte: todayEndUTC },
//                     endDate: { $gte: todayStartUTC }
//                 });

//                 attendance = new Attendance({
//                     employee: user._id,
//                     date: todayStartUTC,
//                     status: leave ? "On Leave" : "Present",
//                     workingDays: employee.workingDays,
//                     leave: leave ? leave._id : null,
//                 });

//                 await attendance.save();
//                 console.log("✅ Attendance saved:", attendance);
//             }
//         }
//     }



//     // ✅ Generate JWT tokens
//     const payload = {
//         _id: user._id,
//         role: user.role,
//         phone: user.phone,
//         isAdmin
//     };

//     const token = jwt.sign(payload, JWT_USER_SECRET, { expiresIn: "360d" });
//     const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "365d" });

//     res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     if (!isStaticOtp) await LoginOtp.deleteOne({ mobileNumber });

//     return res.status(200).json({
//         success: true,
//         data: { token, user, refreshToken },
//         message: "OTP verified successfully"
//     });
// });


//static otp
export const verifyOtp = asyncHandler(async (req, res) => {
    const verifyOtpSchema = Joi.object({
        mobileNumber: Joi.string().required(),
        otp: Joi.string().length(6).required(),
    });

    const { error } = verifyOtpSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    const { mobileNumber, otp } = req.body;

    const isStaticOtp = otp === "555555";

    if (!isStaticOtp) {
        const otpRecord = await LoginOtp.findOne({ mobileNumber });
        if (!otpRecord) return res.status(400).json({ success: false, message: "No OTP sent to this number" });
        if (otpRecord.expiresAt < new Date()) return res.status(400).json({ success: false, message: "OTP has expired" });
        if (otpRecord.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // 🔍 Check for User (including both engineer + office staff)
    let user = await User.findOne({
        phone: mobileNumber,
        $or: [
            { role: "Customer" },
            { role: "Manufacturer" },
            { role: "Dealer" },
            { role: "Employee", technicianType: "engineer", status: "active" },
            { role: "Employee", technicianType: "office-staff", status: "active" }
        ]
    });

    let isAdmin = false;

    if (!user) {
        user = await Admin.findOne({ phoneNumber: mobileNumber });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User/Admin not found or not allowed"
            });
        }
        isAdmin = true;
    }

    // 🕒 Engineer attendance + COMP-OFF logic
    if (!isAdmin && user.role === "Employee" && user.technicianType === "engineer") {
        const employee = await Employee.findOne({ _id: user._id, technicianType: "engineer" });

        if (employee) {
            const now = new Date();

            const todayStartLocal = new Date(now);
            todayStartLocal.setHours(0, 0, 0, 0);

            const todayEndLocal = new Date(now);
            todayEndLocal.setHours(23, 59, 59, 999);

            const offsetMs = todayStartLocal.getTimezoneOffset() * 60 * 1000;
            const todayStartUTC = new Date(todayStartLocal.getTime() - offsetMs);
            const todayEndUTC = new Date(todayEndLocal.getTime() - offsetMs);

            let attendance = await Attendance.findOne({
                employee: user._id,
                date: { $gte: todayStartUTC, $lte: todayEndUTC }
            });

            let attendanceStatus = "Present";

            if (!attendance) {
                const leave = await Leave.findOne({
                    employee: user._id,
                    status: "Approved",
                    startDate: { $lte: todayEndUTC },
                    endDate: { $gte: todayStartUTC }
                });

                attendanceStatus = leave ? "On Leave" : "Present";

                attendance = new Attendance({
                    employee: user._id,
                    date: todayStartUTC,
                    status: attendanceStatus,
                    workingDays: employee.workingDays,
                    leave: leave ? leave._id : null,
                });

                await attendance.save();

                // ⭐⭐⭐ COMP-OFF (Saturday + Sunday) ⭐⭐⭐
                const todayDay = todayStartLocal.getDay(); // 0 = Sun, 6 = Sat
                const todayIsHoliday = todayDay === 0 || todayDay === 6;

                if (todayIsHoliday && attendanceStatus === "Present") {
                    const currentYear = new Date().getFullYear();

                    let allocation = await LeaveAllocation.findOne({
                        employee: user._id,
                        year: currentYear
                    });

                    if (allocation) {
                        allocation.totalLeaves += 1;
                        await allocation.save();
                    } else {
                        await LeaveAllocation.create({
                            employee: user._id,
                            year: currentYear,
                            totalLeaves: 1,
                            usedLeaves: 0
                        });
                    }
                }
            }
        }
    }

    // Generate JWT
    const payload = {
        _id: user._id,
        role: user.role,
        phone: user.phone,
        isAdmin
    };

    const token = jwt.sign(payload, JWT_USER_SECRET, { expiresIn: "360d" });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "365d" });

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (!isStaticOtp) await LoginOtp.deleteOne({ mobileNumber });

    return res.status(200).json({
        success: true,
        data: { token, user, refreshToken },
        message: "OTP verified successfully"
    });
});




//verify otp--procuction
// export const verifyOtp = asyncHandler(async (req, res) => {
//     const verifyOtpSchema = Joi.object({
//         mobileNumber: Joi.string().required(),
//         otp: Joi.string().length(6).required(),
//     });

//     const { error } = verifyOtpSchema.validate(req.body);
//     if (error) {
//         return res.status(400).json({
//             success: false,
//             message: error.details[0].message
//         });
//     }

//     const { mobileNumber, otp } = req.body;

//     // 🔐 Always verify OTP from DB (static OTP removed)
//     const otpRecord = await LoginOtp.findOne({ mobileNumber });
//     if (!otpRecord) {
//         return res.status(400).json({
//             success: false,
//             message: "No OTP sent to this number"
//         });
//     }

//     if (otpRecord.expiresAt < new Date()) {
//         return res.status(400).json({
//             success: false,
//             message: "OTP has expired"
//         });
//     }

//     if (otpRecord.otp !== otp) {
//         return res.status(400).json({
//             success: false,
//             message: "Invalid OTP"
//         });
//     }

//     // 🔍 Check for User or Admin
//     let user = await User.findOne({
//         phone: mobileNumber,
//         $or: [
//             { role: "Customer" },
//             { role: "Manufacturer" },
//             { role: "Dealer" },
//             { role: "Employee", technicianType: "engineer", status: "active" },
//             { role: "Employee", technicianType: "office-staff", status: "active" }
//         ]
//     });

//     let isAdmin = false;

//     if (!user) {
//         user = await Admin.findOne({ phoneNumber: mobileNumber });
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User/Admin not found or not allowed"
//             });
//         }
//         isAdmin = true;
//     }

//     // 🕒 Engineer attendance + COMP-OFF logic
//     if (!isAdmin && user.role === "Employee" && user.technicianType === "engineer") {
//         const employee = await Employee.findOne({ _id: user._id, technicianType: "engineer" });

//         if (employee) {
//             const now = new Date();

//             const todayStartLocal = new Date(now);
//             todayStartLocal.setHours(0, 0, 0, 0);

//             const todayEndLocal = new Date(now);
//             todayEndLocal.setHours(23, 59, 59, 999);

//             const offsetMs = todayStartLocal.getTimezoneOffset() * 60 * 1000;
//             const todayStartUTC = new Date(todayStartLocal.getTime() - offsetMs);
//             const todayEndUTC = new Date(todayEndLocal.getTime() - offsetMs);

//             let attendance = await Attendance.findOne({
//                 employee: user._id,
//                 date: { $gte: todayStartUTC, $lte: todayEndUTC }
//             });

//             let attendanceStatus = "Present";

//             if (!attendance) {
//                 const leave = await Leave.findOne({
//                     employee: user._id,
//                     status: "Approved",
//                     startDate: { $lte: todayEndUTC },
//                     endDate: { $gte: todayStartUTC }
//                 });

//                 attendanceStatus = leave ? "On Leave" : "Present";

//                 attendance = new Attendance({
//                     employee: user._id,
//                     date: todayStartUTC,
//                     status: attendanceStatus,
//                     workingDays: employee.workingDays,
//                     leave: leave ? leave._id : null,
//                 });

//                 await attendance.save();

//                 // ⭐ COMP-OFF logic
//                 const todayDay = todayStartLocal.getDay();
//                 const todayIsHoliday = todayDay === 0 || todayDay === 6;

//                 if (todayIsHoliday && attendanceStatus === "Present") {
//                     const currentYear = new Date().getFullYear();

//                     let allocation = await LeaveAllocation.findOne({
//                         employee: user._id,
//                         year: currentYear
//                     });

//                     if (allocation) {
//                         allocation.totalLeaves += 1;
//                         await allocation.save();
//                     } else {
//                         await LeaveAllocation.create({
//                             employee: user._id,
//                             year: currentYear,
//                             totalLeaves: 1,
//                             usedLeaves: 0
//                         });
//                     }
//                 }
//             }
//         }
//     }

//     // 🔑 Generate JWT
//     const payload = {
//         _id: user._id,
//         role: user.role,
//         phone: user.phone,
//         isAdmin
//     };

//     const token = jwt.sign(payload, JWT_USER_SECRET, { expiresIn: "360d" });
//     const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "365d" });

//     res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     // delete OTP after successful verification
//     await LoginOtp.deleteOne({ mobileNumber });

//     return res.status(200).json({
//         success: true,
//         data: { token, user, refreshToken },
//         message: "OTP verified successfully"
//     });
// });


// export const resetPassword = asyncHandler(async (req, res) => {
//     try {
//         let { phone, password } = req.body;

//         if (!phone || !password) {
//             return res.status(400).json({ message: "Phone and password are required" });
//         }

//         phone = phone.toString().trim();
//         console.log("🔍 Incoming reset request for phone:", phone);

//         // 1️⃣ Try Admin first (phoneNumber is stored as String)
//         let account = await Admin.findOne({ phoneNumber: phone });
//         let accountType = "Admin";

//         // 2️⃣ If not found, try Employee (phone stored as Number)
//         if (!account) {
//             account = await Employee.findOne({
//                 phone: Number(phone),
//                 technicianType: "office-staff",
//                 status: "active"
//             });
//             accountType = "Office Staff";
//         }

//         // 3️⃣ If no match, return error
//         if (!account) {
//             return res.status(404).json({ message: "No Admin or active Office Staff found for this phone" });
//         }

//         console.log(`✅ Found ${accountType}:`, account.email || account.phone);

//         // 4️⃣ Hash new password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         console.log("🔑 New Hash Generated:", hashedPassword);

//         account.password = hashedPassword;
//         await account.save();

//         console.log(`💾 ${accountType} Password Updated Successfully`);

//         res.status(200).json({
//             success: true,
//             message: `${accountType} password reset successful`,
//         });
//     } catch (error) {
//         console.error("🚨 resetPassword error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// });



export const logout = asyncHandler(async (req, res) => {
    try {
        // Clear refresh token cookie
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        // Optionally: You can also return a message
        return res.status(200).json(
            new ApiResponse(200, null, "Logged out successfully")
        );
    } catch (err) {
        console.error("Logout error:", err);
        throw new ApiError(500, "Failed to logout");
    }
});