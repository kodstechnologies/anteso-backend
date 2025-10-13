// middlewares/authorize.js
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user's role is allowed
        if (!allowedRoles.includes(req.user.role)) {
            console.log("🚀 ~ Access denied for role:", req.user.role);

            // Send JSON response instead of throwing
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Role is allowed → continue
        next();
    };
};
