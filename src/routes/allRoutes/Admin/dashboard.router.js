import { Router } from "express";
const router = Router();
import DashboardController from "../../../controllers/Admin/dashboard.controller.js"
router.get('/summary', DashboardController.getDashboardSummary);
router.get('/monthly-stats', DashboardController.getMonthlyStats);

router.get('/employee-trips', DashboardController.getEmployeeTrips);

// router.get('/trips-overview', DashboardController.getTripsOverview);


export default router