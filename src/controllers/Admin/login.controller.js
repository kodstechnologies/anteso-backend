import Admin from "../../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { loginSchema } from "../../validators/adminValidators.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import Employee from "../../models/technician.model.js";
const JWT_SECRET = process.env.JWT_SECRET;
console.log("🚀 ~ JWT_SECRET:", JWT_SECRET)
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
console.log("🚀 ~ JWT_REFRESH_SECRET:", JWT_REFRESH_SECRET)


// const adminLogin = asyncHandler(async (req, res) => {
//     // 1. Validate input
//     const { error, value } = loginSchema.validate(req.body);
//     if (error) {
//         throw new ApiError(400, error.details[0].message);
//     }
//     const { email, password } = value;
//     console.log("🚀 ~ password:", password)
//     console.log("🚀 ~ email:", email)
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
//     console.log("🚀 ~ value:", value)
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
//     console.log("🚀 ~ employee:", employee)
//     if (employee) {
//         const isPasswordValid = await bcrypt.compare(password, employee.password);
//         console.log("🚀 ~ isPasswordValid:", isPasswordValid)
//         if (!isPasswordValid) {
//             throw new ApiError(401, "Invalid email or password");
//         }

//         const accessToken = jwt.sign(
//             { id: employee._id, email: employee.email, role: 'staff' },
//             process.env.JWT_SECRET,
//             { expiresIn: '360d' }
//         );
//         console.log("🚀 ~ accessToken:", accessToken)
//         const refreshToken = jwt.sign(
//             { id: employee._id },
//             process.env.JWT_REFRESH_SECRET,
//             { expiresIn: '365d' }
//         );
//         console.log("🚀 ~ refreshToken:", refreshToken)

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
            { id: admin._id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '360d' }
        );
        const refreshToken = jwt.sign(
            { id: admin._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '365d' }
        );

        return res.status(200).json(
            new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
        );
    }

    // 3. Check Employee (office-staff only)
    const employee = await Employee.findOne({ email, status: 'active', technicianType: 'office-staff' });
    if (employee) {
        const isPasswordValid = await bcrypt.compare(password, employee.password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid email or password");

        const accessToken = jwt.sign(
            { id: employee._id, email: employee.email, role: 'staff' },
            process.env.JWT_SECRET,
            { expiresIn: '360d' }
        );
        const refreshToken = jwt.sign(
            { id: employee._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '365d' }
        );

        // ✅ Mark staff as present for today
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to start of day

        await Attendance.findOneAndUpdate(
            { employee: employee._id, date: today },
            { employee: employee._id, date: today, status: 'Present' },
            { upsert: true, new: true } // create if not exists
        );

        return res.status(200).json(
            new ApiResponse(200, { accessToken, refreshToken }, "Login successful")
        );
    }

    // 4. If neither admin nor active staff
    throw new ApiError(401, "Invalid email or password");
});


const staffLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    console.log("🚀 ~ password:", password)
    console.log("🚀 ~ email:", email)

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

const resetPassword = asyncHandler(async (req, res) => {
    try {

    } catch (error) {

    }
})


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

export default { adminLogin, staffLogin }
