import Joi from "joi";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import LoginOtp from "../../models/otpLogins.model.js";
import sendSMS from "../../utils/SendSMS.js";
import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";
import Employee from "../../models/technician.model.js";

const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
const JWT_REFRESH_SECRET=process.env.JWT_REFRESH_SECRET

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



export const sendOtp = asyncHandler(async (req, res) => {
    const mobileVerifySchema = Joi.object({
        mobileNumber: Joi.string().required(),
    });

    const { error } = mobileVerifySchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { mobileNumber } = req.body;

    // Check for customer OR engineer employee
    const existingUser = await User.findOne({
        phone: mobileNumber,
        $or: [
            { role: "Customer" },
            { role: "Employee", technicianType: "engineer", status: "active" }
        ]
    });

    console.log("🚀 ~ existingUser:", existingUser);

    if (!existingUser) {
        throw new ApiError(
            404,
            "Mobile number not registered!"
        );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🚀 ~ otp:", otp)
    console.log("🚀 ~ sendOtp ~ otp:", otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const message = `Dear User, Your OTP for login is ${otp}. It is valid for 10 minutes. Please do not share this OTP with anyone. - ANTESO BIOMEDICAL`;

    try {
        await sendSMS(mobileNumber, message);

        await LoginOtp.findOneAndUpdate(
            { mobileNumber },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        return res.status(200).json(
            new ApiResponse(200, null, "OTP sent successfully")
        );
    } catch (err) {
        console.error("Error sending OTP:", err);
        throw new ApiError(500, "Failed to send OTP", [err.message]);
    }
});

// ================== VERIFY OTP ==================
export const verifyOtp = asyncHandler(async (req, res) => {
    const verifyOtpSchema = Joi.object({
        mobileNumber: Joi.string().required(),
        otp: Joi.string().length(6).required()
    });

    const { error } = verifyOtpSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    const { mobileNumber, otp } = req.body;
    const otpRecord = await LoginOtp.findOne({ mobileNumber });

    if (!otpRecord) throw new ApiError(400, "No OTP sent to this number");
    if (otpRecord.expiresAt < new Date()) throw new ApiError(400, "OTP has expired");
    if (otpRecord.otp !== otp) throw new ApiError(400, "Invalid OTP");

    // ✅ Allow "Customer" OR "Employee" with technicianType = "engineer"
    let user = await User.findOne({ phone: mobileNumber, role: "Customer" });

    if (!user) {
        user = await User.findOne({ phone: mobileNumber, role: "Employee" }).populate("Employee");
        if (!user) throw new ApiError(404, "User not found or not allowed");

        // make sure it is an engineer
        const employee = await Employee.findOne({ _id: user._id, technicianType: "engineer" });
        if (!employee) throw new ApiError(403, "Only engineers are allowed");
    }

    const payload = {
        _id: user._id,
        role: user.role,
        phone: user.phone,
    };

    const token = jwt.sign(payload, JWT_USER_SECRET, { expiresIn: "5m" });
    console.log("🚀 ~ token:", token)
    // Refresh token (long life)
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "5m" });
    console.log("🚀 ~ refreshToken:", refreshToken)

    // ✅ Store refresh token in secure HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove OTP record after successful verification
    await LoginOtp.deleteOne({ mobileNumber });

    return res.status(200).json(
        new ApiResponse(200, { token, user, refreshToken }, "OTP verified successfully")
    );
});



//test otp functions--without send sms

// const HARDCODED_MOBILE = "6360351881";
// const HARDCODED_OTP = "123456";

// export const sendOtp = asyncHandler(async (req, res) => {
//     const mobileVerifySchema = Joi.object({
//         mobileNumber: Joi.string().required(),
//     });

//     const { error } = mobileVerifySchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);

//     const { mobileNumber } = req.body;

//     // Allow only hardcoded number
//     if (mobileNumber !== HARDCODED_MOBILE) {
//         throw new ApiError(403, "This number is not allowed in test mode.");
//     }

//     const existingUser = await User.findOne({ phone: mobileNumber });
//     if (!existingUser) {
//         throw new ApiError(404, "Mobile number not registered! Please contact admin.");
//     }

//     // Skip sending SMS
//     console.log(`Mock OTP for ${mobileNumber}: ${HARDCODED_OTP}`);

//     return res.status(200).json(
//         new ApiResponse(200, null, "Mock OTP generated successfully")
//     );
// });

// export const verifyOtp = asyncHandler(async (req, res) => {
//     const verifyOtpSchema = Joi.object({
//         mobileNumber: Joi.string().required(),
//         otp: Joi.string().length(6).required()
//     });
//     const { error } = verifyOtpSchema.validate(req.body);
//     if (error) throw new ApiError(400, error.details[0].message);
//     const { mobileNumber, otp } = req.body;
//     if (mobileNumber !== HARDCODED_MOBILE) {
//         throw new ApiError(403, "This number is not allowed in test mode.");
//     }
//     if (otp !== HARDCODED_OTP) {
//         throw new ApiError(400, "Invalid OTP");
//     }
//     const user = await User.findOne({ phone: mobileNumber });
//     if (!user) throw new ApiError(404, "User not found");
//     const payload = {
//         _id: user._id,
//         role: user.role,
//         phone: user.phone,
//     };
//     const token = jwt.sign(payload, JWT_USER_SECRET, { expiresIn: "1h" });
//     return res.status(200).json(
//         new ApiResponse(200, { token, user }, "OTP verified successfully")
//     );
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