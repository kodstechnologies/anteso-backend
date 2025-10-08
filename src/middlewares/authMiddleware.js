// // middlewares/authMiddleware.js
// import jwt from "jsonwebtoken";
// import { ApiError } from "../utils/ApiError.js";

// const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
// const JWT_ADMIN_SECRET = process.env.JWT_SECRET;

// export const authenticate = (req, res, next) => {
//     const token = req.headers.authorization?.split(" ")[1];
//     console.log("🚀 ~ authenticate ~ token:", token)
//     if (!token) throw new ApiError(401, "Token missing");

//     let decoded;
//     try {
//         decoded = jwt.verify(token, JWT_ADMIN_SECRET);
//     } catch (err) {
//         try {
//             decoded = jwt.verify(token, JWT_USER_SECRET);
//         } catch (innerErr) {
//             throw new ApiError(401, "Invalid or expired token");
//         }
//     }
//     console.log("✅ Token authenticated:", decoded);
//     req.user = decoded;
//     next();
// };

// middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const JWT_USER_SECRET = process.env.JWT_USER_SECRET;
const JWT_ADMIN_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
export const refreshAccessToken = asyncHandler(async (req, res) => {
    // Check if body exists and has refreshToken
    if (!req.body || !req.body.refreshToken) {
        return res.status(400).json({
            status: 400,
            data: null,
            message: "Request body missing or refreshToken not provided"
        });
    }

    const { refreshToken } = req.body;

    try {
        // verify the refresh token
        console.log("helloo");
        console.log("👉 Incoming refresh route hit, body:", req.body);


        const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
        console.log("🚀 ~ decoded:", decoded);

        // create a new access token
        const newAccessToken = jwt.sign(
            { _id: decoded._id, role: decoded.role, phone: decoded.phone },
            JWT_USER_SECRET,
            { expiresIn: "5m" }
        );

        // create a new refresh token
        const newRefreshToken = jwt.sign(
            { _id: decoded._id, role: decoded.role, phone: decoded.phone },
            JWT_REFRESH_SECRET,
            { expiresIn: "5m" }
        );

        res.status(200).json(
            new ApiResponse(
                200,
                { accessToken: newAccessToken, refreshToken: newRefreshToken },
                "Tokens refreshed successfully"
            )
        );
    } catch (err) {
        console.error("🚀 ~ refreshAccessToken error:", err.message);
        return res.status(401).json({
            status: 401,
            data: null,
            message: "Invalid or expired refresh token"
        });
    }
});
// helper function to try verifying a token
const verifyToken = (token, secret, type) => {
    try {
        const decoded = jwt.verify(token, secret);
        console.log("🚀 ~ verifyToken ~ decoded:", decoded)
        return { ...decoded, type };
    } catch {
        return null; // if fails, just return null instead of throwing
    }
};

export const authenticate = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log("🚀 ~ authenticate ~ token:", token);

        if (!token) {
            return res.status(401).json({
                status: 401,
                data: null,
                message: "Token missing",
            });
        }

        // Try admin token first, then user token
        const user =
            verifyToken(token, JWT_ADMIN_SECRET, "admin") ||
            verifyToken(token, JWT_USER_SECRET, "user");

        if (!user) {
            return res.status(401).json({
                status: 401,
                data: null,
                message: "Invalid or expired token",
            });
        }

        req.user = user;
        console.log("✅ Token authenticated:", req.user);

        next();
    } catch (err) {
        console.error("🚀 ~ authenticate error:", err.message);
        return res.status(401).json({
            status: 401,
            data: null,
            message: "Authentication failed",
        });
    }
};

// export const refreshAccessToken = asyncHandler(async (req, res) => {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) {
//         throw new ApiError(401, "Refresh token missing");
//     }

//     try {
//         const decoded = jwt.verify(refreshToken, JWT_USER_SECRET);
//         console.log("🚀 ~ decoded:", decoded);

//         const newAccessToken = jwt.sign(
//             { _id: decoded._id, role: decoded.role, phone: decoded.phone },
//             JWT_USER_SECRET,
//             { expiresIn: "15m" }
//         );
//         console.log("🚀 ~ newAccessToken:", newAccessToken);

//         res
//             .status(200)
//             .json(new ApiResponse(200, { accessToken: newAccessToken }, "Access token refreshed"));
//         return; // very important
//     } catch (err) {
//         console.error("🚀 ~ refreshAccessToken error:", err.message);
//         throw new ApiError(401, "Invalid or expired refresh token");
//     }
// });
