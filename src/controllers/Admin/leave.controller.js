import mongoose from 'mongoose';
import { LeaveAllocation } from '../../models/allocateLeaves.model.js';
import Leave from '../../models/leave.model.js';
import Employee from '../../models/technician.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/AsyncHandler.js';
import { leaveValidationSchema } from '../../validators/leaveValidators.js';
import Attendance from '../../models/attendanceSchema.model.js';

const add = asyncHandler(async (req, res) => {
    // ✅ Validate input
    await leaveValidationSchema.validate(req.body);

    const { employee, startDate, endDate, leaveType, reason } = req.body;
    console.log("🚀 ~ req.body:", req.body)

    // ✅ Check if employee exists
    const existingEmployee = await Employee.findById(employee);
    if (!existingEmployee) {
        return res.status(404).json(new ApiResponse(404, null, "Employee not found"));
    }

    // ✅ Create new leave record
    const leave = await Leave.create({
        employee, // reference to employee (technician)
        startDate,
        endDate,
        leaveType,
        reason,
    });

    res.status(201).json(new ApiResponse(201, leave, "Leave created successfully"));
});

const getLeaveById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const leave = await Leave.findById(id)
        .populate("employee", "name designation"); // populate employee name + designation

    if (!leave) {
        throw new ApiError(404, "Leave not found");
    }

    res.status(200).json(
        new ApiResponse(200, leave, "Leave fetched successfully")
    );
});


const getAllLeaves = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;
    const totalLeaves = await Leave.countDocuments();

    // ✅ If no leaves exist, return empty array but still success
    if (totalLeaves === 0) {
        return res.status(200).json(
            new ApiResponse(200, {
                total: 0,
                page,
                limit,
                totalPages: 0,
                data: []

            }, "No leaves found")
        );
    }

    const leaves = await Leave.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

    res.status(200).json(
        new ApiResponse(200, {
            total: totalLeaves,
            page,
            limit,
            totalPages: Math.ceil(totalLeaves / limit),
            data: leaves
        }, "Leaves fetched successfully")
    );
});

// const updateLeaveById = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     const updatedLeave = await Leave.findByIdAndUpdate(
//         id,
//         { $set: req.body },
//         { new: true, runValidators: true }
//     );
//     if (!updatedLeave) {
//         throw new ApiError(404, "Leave not found");
//     }
//     res.status(200).json(new ApiResponse(200, updatedLeave, "Leave updated successfully"));
// });



const updateLeaveById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // ✅ If employee field is being updated, validate it
    if (updateData.employee) {
        const existingEmployee = await Employee.findById(updateData.employee);
        if (!existingEmployee) {
            throw new ApiError(404, "Employee not found");
        }
    }

    // ✅ Update leave document
    const updatedLeave = await Leave.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    ).populate("employee", "name designation");

    if (!updatedLeave) {
        throw new ApiError(404, "Leave not found");
    }

    res.status(200).json(
        new ApiResponse(200, updatedLeave, "Leave updated successfully")
    );
});


const deleteLeaveById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deleted = await Leave.findByIdAndDelete(id);
    if (!deleted) {
        throw new ApiError(404, "Leave not found");
    }
    res.status(200).json(new ApiResponse(200, deleted, "Leave deleted successfully"));
});

const applyForLeave = asyncHandler(async (req, res) => {
    try {
        const { startDate, endDate, leaveType, reason } = req.body;

        // Optional: get technician ID from req.user if using auth middleware
        const { technicianId } = req.params;

        if (!startDate || !endDate || !leaveType || !reason) {
            throw new ApiError(400, "All leave details must be provided");
        }

        // Validate leave type
        const validLeaveTypes = ['Sick Leave', 'Casual Leave', 'Maternity/Paternity', 'Leave without pay', 'Leave with pay'];
        if (!validLeaveTypes.includes(leaveType)) {
            throw new ApiError(400, "Invalid leave type");
        }

        // Check date logic
        if (new Date(startDate) > new Date(endDate)) {
            throw new ApiError(400, "Start date cannot be after end date");
        }

        const leave = new Leave({
            startDate,
            endDate,
            leaveType,
            reason,
            employee: technicianId
        });

        await leave.save();

        return res.status(201).json(
            new ApiResponse(201, leave, "Leave applied successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to apply for leave");
    }
});

// const getLeaveByType=asyncHandler(async(req,res)=>{
//     try {

//     } catch (error) {

//     }
// })


const getAllLeavesByCustomerId = asyncHandler(async (req, res) => {
    try {
        const { technicianId } = req.params;
        if (!technicianId) {
            return res.status(400).json({ message: "Technician ID is required" });
        }
        const leaves = await Leave.find({ employee: technicianId })
            .populate("employee", "name email empId") // optional: populate employee info
            .sort({ createdAt: -1 }); // newest first

        if (!leaves || leaves.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: []
            });
        }
        return res.status(200).json({
            success: true,
            count: leaves.length,
            data: leaves
        });
    } catch (error) {
        console.error("Error fetching leaves:", error);
        res.status(500).json({ message: "Failed to fetch leave records" });
    }
});


const approveLeave = asyncHandler(async (req, res) => {
    try {
        const { employeeId, leaveId } = req.params;

        const leave = await Leave.findOne({ _id: leaveId, employee: employeeId });
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found for this employee",
            });
        }

        // Update status to Approved
        leave.status = "Approved";
        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave approved successfully",
            data: leave.status,
        });
    } catch (error) {
        console.error("Approve Leave Error:", error);
        res.status(500).json({
            success: false,
            message: "Error approving leave",
            error: error.message,
        });
    }
});

// const rejectLeave = asyncHandler(async (req, res) => {
//     try {
//         const { employeeId, leaveId } = req.params;

//         const leave = await Leave.findOne({ _id: leaveId, employee: employeeId });
//         if (!leave) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Leave request not found for this employee",
//             });
//         }

//         // Update status to Rejected
//         leave.status = "Rejected";
//         await leave.save();

//         res.status(200).json({
//             success: true,
//             message: "Leave rejected successfully",
//             data: leave,
//         });
//     } catch (error) {
//         console.error("Reject Leave Error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Error rejecting leave",
//             error: error.message,
//         });
//     }
// });

const rejectLeave = asyncHandler(async (req, res) => {
    try {
        const { employeeId, leaveId } = req.params;

        const leave = await Leave.findOne({ _id: leaveId, employee: employeeId });
        if (!leave) {
            return res.status(404).json({
                success: false,
                message: "Leave request not found for this employee",
            });
        }

        // ❌ If already Approved, don't allow rejection
        if (leave.status === "Approved") {
            return res.status(400).json({
                success: false,
                message: "Cannot reject an already approved leave",
            });
        }

        // ✅ Update status to Rejected (only if Pending or already Rejected)
        leave.status = "Rejected";
        await leave.save();

        res.status(200).json({
            success: true,
            message: "Leave rejected successfully",
            data: leave,
        });
    } catch (error) {
        console.error("Reject Leave Error:", error);
        res.status(500).json({
            success: false,
            message: "Error rejecting leave",
            error: error.message,
        });
    }
});


const allocateLeaves = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;
    const { year, totalLeaves } = req.body;

    if (!employeeId || !year || totalLeaves === undefined) {
        return res.status(400).json({ message: 'employeeId (params), year, and totalLeaves (body) are required' });
    }

    let leaveAllocation = await LeaveAllocation.findOne({ employee: employeeId, year });

    if (leaveAllocation) {
        leaveAllocation.totalLeaves = totalLeaves;
        await leaveAllocation.save();
        return res.status(200).json({ message: 'Leave allocation updated', leave: leaveAllocation });
    } else {
        leaveAllocation = await LeaveAllocation.create({
            employee: employeeId,
            year,
            totalLeaves,
            usedLeaves: 0,
        });
        return res.status(201).json({ message: 'Leave allocation created', leave: leaveAllocation });
    }
});

const getLeaveAllocation = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    if (!employeeId) {
        return res.status(400).json({ message: 'employeeId (params) is required' });
    }

    // Fetch all leave allocations for the employee
    const leaveAllocations = await LeaveAllocation.find({ employee: employeeId }).sort({ year: -1 });

    if (!leaveAllocations || leaveAllocations.length === 0) {
        return res.status(200).json([]); // Return empty array if none
    }

    // Map the allocations to a standard format
    const formattedAllocations = leaveAllocations.map((allocation) => ({
        year: allocation.year,
        totalLeaves: allocation.totalLeaves,
        usedLeaves: allocation.usedLeaves,
        remainingLeaves: allocation.totalLeaves - allocation.usedLeaves,
    }));

    return res.status(200).json(formattedAllocations);
});
const attendanceSummary = asyncHandler(async (req, res) => {
    const { employeeId } = req.params;

    // Validate employeeId
    if (!employeeId || !mongoose.Types.ObjectId.isValid(employeeId)) {
        return res.status(400).json({ message: "Valid employeeId is required" });
    }

    try {
        // Fetch employee details
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const totalWorkingDays = employee.workingDays || 0;

        // Get attendance records
        const attendanceRecords = await Attendance.find({ employee: employeeId });
        const daysPresent = attendanceRecords.filter(a => a.status === "Present").length;

        // Get approved leaves
        const leaves = await Leave.find({ employee: employeeId, status: "Approved" });

        // Calculate total leave days (including multi-day leaves)
        let totalLeaveDays = 0;
        const leaveTypeSummary = {};
        leaves.forEach(leave => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // include start day
            totalLeaveDays += diffDays;

            // Group by leave type
            leaveTypeSummary[leave.leaveType] = (leaveTypeSummary[leave.leaveType] || 0) + diffDays;
        });

        // Calculate attendance rate
        const attendanceRate =
            totalWorkingDays > 0 ? ((daysPresent / totalWorkingDays) * 100).toFixed(2) : "0.00";

        // Return summary
        return res.status(200).json({
            employeeId,
            employeeName: employee.name,
            totalWorkingDays,
            daysPresent,
            totalLeaveDays,
            leaveTypeSummary,
            attendanceRate: Number(attendanceRate),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to fetch attendance summary", error: error.message });
    }
});

export default { add, getLeaveById, getAllLeaves, updateLeaveById, deleteLeaveById, applyForLeave, getAllLeavesByCustomerId, approveLeave, rejectLeave, allocateLeaves, getLeaveAllocation, attendanceSummary }
// export default {createLeave,getLeavesByEmployeeId,updateLeaveByEmployee,deleteLeaveByEmployee}