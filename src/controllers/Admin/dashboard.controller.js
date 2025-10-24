import Enquiry from "../../models/enquiry.model.js";
import orderModel from "../../models/order.model.js";
import Employee from "../../models/technician.model.js";
import Tools from "../../models/tools.model.js";
import tripModel from "../../models/trip.model.js";
import { asyncHandler } from "../../utils/AsyncHandler.js";

const getDashboardSummary = asyncHandler(async (req, res) => {
    try {
        // Count Employees
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: "active" });

        // Count Tools
        const totalTools = await Tools.countDocuments();
        const assignedTools = await Tools.countDocuments({ toolStatus: "assigned" });
        const unassignedTools = await Tools.countDocuments({ toolStatus: "unassigned" });

        // Count Enquiries
        const totalEnquiries = await Enquiry.countDocuments();
        const approvedEnquiries = await Enquiry.countDocuments({ enquiryStatus: "Approved" });

        // Count Orders
        const totalOrders = await orderModel.countDocuments();
        const completedOrders = await orderModel.countDocuments({ status: "completed" });
        const pendingOrders = await orderModel.countDocuments({ status: "pending" });
        const inprogressOrders = await orderModel.countDocuments({ status: "inprogress" });

        // Count Trips
        const totalTrips = await tripModel.countDocuments();
        const completedTrips = await tripModel.countDocuments({ tripstatus: "completed" });
        const ongoingTrips = await tripModel.countDocuments({ tripstatus: "ongoing" });

        // Construct summary object
        const summary = {
            employees: {
                total: totalEmployees,
                active: activeEmployees,
            },
            tools: {
                total: totalTools,
                assigned: assignedTools,
                unassigned: unassignedTools,
            },
            enquiries: {
                total: totalEnquiries,
                approved: approvedEnquiries,
            },
            orders: {
                total: totalOrders,
                completed: completedOrders,
                pending: pendingOrders,
                inprogress: inprogressOrders,
            },
            trips: {
                total: totalTrips,
                completed: completedTrips,
                ongoing: ongoingTrips,
            },
        };

        res.status(200).json({
            success: true,
            message: "Dashboard summary fetched successfully",
            data: summary,
        });
    } catch (error) {
        console.error("🚀 ~ getDashboardSummary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard summary",
            error: error.message,
        });
    }
});

// 2️⃣ Bar Chart (Trips Overview)
//  const getTripsOverview = asyncHandler(async (req, res) => {
//     // Assuming you track trips as Orders with a status
//     const totalEmployees = await Employee.countDocuments();
//     const completedTrips = await orderModel.countDocuments({ status: 'completed' });
//     const ongoingTrips = await orderModel.countDocuments({ status: 'inprogress' });

//     res.status(200).json({
//         employees: totalEmployees,
//         completedTrips,
//         ongoingTrips,
//     });
// });

const getMonthlyStats = asyncHandler(async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Fetch orders created in the current month
        const orders = await orderModel.find({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        // Optionally, group by day or status if needed
        const stats = [{
            month: now.toLocaleString('default', { month: 'short' }),
            orders: orders.length
        }];

        res.status(200).json({ success: true, data: stats });


        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        console.error('Error in getMonthlyStats:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch monthly orders' });
    }
});

// ✅ Employee Trips API
const getEmployeeTrips = asyncHandler(async (req, res) => {
    try {
        const trips = await tripModel.find()
            .populate('technician', 'name')
            .sort({ startDate: -1 });

        const employeeTrips = trips.map(trip => ({
            employee: trip.technician?.name || 'N/A',
            tripName: trip.tripName,
            startDate: trip.startDate.toISOString().split('T')[0],
            endDate: trip.endDate.toISOString().split('T')[0],
            tripStatus: trip.tripstatus || 'N/A', // ✅ include trip status
        }));

        res.status(200).json({ success: true, data: employeeTrips });
    } catch (error) {
        console.error('Error in getEmployeeTrips:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch employee trips' });
    }
});

export default { getDashboardSummary, getMonthlyStats, getEmployeeTrips }