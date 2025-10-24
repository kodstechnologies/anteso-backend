import { Router } from "express";
import leaveController from "../../../controllers/Admin/leave.controller.js";
const router = Router();
router.post('/add', leaveController.add)
router.get('/get-by-id/:id', leaveController.getLeaveById)
router.put('/update/:id', leaveController.updateLeaveById)
router.get('/all-leaves', leaveController.getAllLeaves)
router.delete('/delete/:id', leaveController.deleteLeaveById)
router.post('/allocate-leaves-all', leaveController.allocateLeavesToAll);
router.get('/leave-allocations', leaveController.getAllLeaveAllocations);
router.get('/attendance-summary/:employeeId', leaveController.attendanceSummary)
// router.get()
// technician
router.post('/apply-for-leave/:technicianId', leaveController.applyForLeave)
router.get('/get-all-leaves/:technicianId', leaveController.getAllLeavesByCustomerId)
router.post('/approve-leave/:employeeId/:leaveId', leaveController.approveLeave)
router.post('/reject-leave/:employeeId/:leaveId', leaveController.rejectLeave)



router.post("/apply-for-leave", leaveController.applyForLeaveByStaff);
router.get("/get-all-leaves/:staffId", leaveController.getAllLeavesByStaffId);
router.get("/get-by-id/:staffId/:leaveId", leaveController.getStaffLeaveById);
router.put("/edit-leave/:staffId/:leaveId", leaveController.editLeaveByStaffId);


export default router