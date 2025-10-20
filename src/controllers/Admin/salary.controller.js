import { asyncHandler } from "../../utils/AsyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import Salary from "../../models/salary.model.js";
import Leave from "../../models/leave.model.js";
import Employee from "../../models/technician.model.js";

// 1. Generate Salary
// const generateSalary = asyncHandler(async (req, res) => {
//     const { employeeId } = req.params; // 👈 take employeeId from params
//     const { date, basicSalary, incentive = 0 } = req.body;
//     console.log("🚀 ~ incentive:", incentive)
//     console.log("🚀 ~ basicSalary:", basicSalary)
//     console.log("🚀 ~ date:", date)

//     if (!employeeId || !date || !basicSalary) {
//         throw new ApiError(400, "Employee, date and basicSalary are required");
//     }

//     const salaryMonth = new Date(date).getMonth(); // 0-based
//     const salaryYear = new Date(date).getFullYear();

//     const leaves = await Leave.find({
//         employee: employeeId,
//         status: "Approved",
//         leaveType: "Leave without pay",
//         $or: [
//             {
//                 startDate: { $lte: new Date(salaryYear, salaryMonth + 1, 0) }, // before end of month
//                 endDate: { $gte: new Date(salaryYear, salaryMonth, 1) },       // after start of month
//             },
//         ],
//     });
//     console.log("🚀 ~ leaves:", leaves)

//     // Calculate total leave without pay days
//     let leaveWithoutPayDays = 0;
//     for (const leave of leaves) {
//         const leaveStart = new Date(
//             Math.max(leave.startDate, new Date(salaryYear, salaryMonth, 1))
//         );
//         const leaveEnd = new Date(
//             Math.min(leave.endDate, new Date(salaryYear, salaryMonth + 1, 0))
//         );
//         const diffDays =
//             Math.floor((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;
//         leaveWithoutPayDays += diffDays;
//     }

//     // Assume 30 days in a month for deduction calc
//     const perDaySalary = basicSalary / 30;
//     const leaveDeduction = leaveWithoutPayDays * perDaySalary;

//     const totalSalary = basicSalary + incentive - leaveDeduction;

//     const salary = new Salary({
//         employee: employeeId,
//         date: new Date(salaryYear, salaryMonth, 1), // store as first of month
//         basicSalary,
//         incentive,
//         leaveWithoutPayDays,
//         leaveDeduction,
//         totalSalary,
//         status: "Pending",
//     });

//     await salary.save();

//     return res
//         .status(201)
//         .json(new ApiResponse(201, salary, "Salary generated successfully"));
// });

const generateSalary = asyncHandler(async (req, res) => {
    const { employeeId } = req.params; // 👈 take employeeId from params
    const { date, basicSalary, incentive = 0, leaveDeduction = 0, totalSalary } = req.body;

    if (!employeeId || !date || !basicSalary || totalSalary === undefined) {
        throw new ApiError(400, "Employee, date, basicSalary and totalSalary are required");
    }

    const salaryMonth = new Date(date).getMonth(); // 0-based
    const salaryYear = new Date(date).getFullYear();

    const salary = new Salary({
        employee: employeeId,
        date: new Date(salaryYear, salaryMonth, 1), // store as first of month
        basicSalary,
        incentive,
        leaveDeduction,
        totalSalary,
        status: "Pending",
    });

    await salary.save();

    return res
        .status(201)
        .json(new ApiResponse(201, salary, "Salary generated successfully"));
});



// 3. Update Salary (mark as Paid/Processed)
const updateSalary = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, incentive, leaveDeduction, totalSalary } = req.body;

    const salary = await Salary.findById(id);
    if (!salary) throw new ApiError(404, "Salary not found");

    // ✅ Update only what’s provided
    if (status) salary.status = status;
    if (incentive !== undefined) salary.incentive = incentive;
    if (leaveDeduction !== undefined) salary.leaveDeduction = leaveDeduction;
    if (totalSalary !== undefined) salary.totalSalary = totalSalary;

    await salary.save();

    return res
        .status(200)
        .json(new ApiResponse(200, salary, "Salary updated successfully"));
});


// 4. List All Salaries
const listSalaries = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!employeeId) {
        throw new ApiError(400, "Employee ID is required");
    }

    let filter = { employee: employeeId };

    // ✅ Add month/year filter if provided
    if (month && year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // last day of month
        filter.date = { $gte: startDate, $lte: endDate };
    }

    const salaries = await Salary.find(filter)
        .populate("employee", "name email")
        .sort({ date: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, salaries, "Salaries fetched successfully"));
});

const getSalaryDetails = asyncHandler(async (req, res) => {
    const { salaryId } = req.params;

    // Fetch salary and populate employee
    const salary = await Salary.findById(salaryId).populate("employee");
    console.log("🚀 ~ salary:", salary)

    if (!salary) {
        res.status(404);
        throw new Error("Salary not found");
    }

    if (!salary.employee) {
        res.status(404);
        throw new Error("Employee not found");
    }

    res.json({
        success: true,
        data: {
            salary: {
                id: salary._id,
                date: salary.date,
                basicSalary: salary.basicSalary,
                incentive: salary.incentive,
                leaveWithoutPayDays: salary.leaveWithoutPayDays,
                leaveDeduction: salary.leaveDeduction,
                totalSalary: salary.totalSalary,
                status: salary.status,
                month: salary.date.getMonth() + 1,
                year: salary.date.getFullYear(),
            },
            employee: {
                id: salary.employee._id,
                name: salary.employee.name,
                email: salary.employee.email,
                phone: salary.employee.phone,
                designation: salary.employee.designation,
                department: salary.employee.department,
            },
        },
    });
});

export const deleteSalary = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const salary = await Salary.findById(id);
    if (!salary) throw new ApiError(404, "Salary not found");

    await salary.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Salary deleted successfully"));
});



const paymentSummary = asyncHandler(async (req, res) => {
    try {
        const { employeeId } = req.params;

        if (!employeeId) {
            throw new ApiError(400, "Employee ID is required");
        }

        // ✅ Fetch salary records for the employee
        const salaries = await Salary.find({ employee: employeeId }).sort({ date: -1 });

        // ✅ If no records found, return empty array (not an error)
        if (!salaries || salaries.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, [], "No payment records found for this employee"));
        }

        // ✅ Prepare structured summary
        const summary = salaries.map((salary) => ({
            month: salary.date.toLocaleString("default", { month: "long", year: "numeric" }),
            basicSalary: salary.basicSalary,
            incentive: salary.incentive,
            leaveWithoutPayDays: salary.leaveWithoutPayDays,
            leaveDeduction: salary.leaveDeduction,
            totalPayable: salary.totalSalary,
            status: salary.status,
        }));

        return res
            .status(200)
            .json(new ApiResponse(200, summary, "Payment summary fetched successfully"));
    } catch (error) {
        console.error("Error in paymentSummary:", error);
        throw new ApiError(500, "Error fetching payment summary");
    }
});

export default { generateSalary, updateSalary, listSalaries, getSalaryDetails, deleteSalary, paymentSummary }