import mongoose from 'mongoose';

const loginOtpSchema = new mongoose.Schema(
    {
        mobileNumber: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        otpExpiry: {
            type: Date,
            required: false,
            index: { expires: 0 },
        },
        // Keep compatibility with existing controller code that writes `expiresAt`
        expiresAt: {
            type: Date,
            required: false,
            index: { expires: 0 },
        },
        // When user selects role after OTP, we set this to true so OTP isn't required again
        otpVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model('LoginOtp', loginOtpSchema);
