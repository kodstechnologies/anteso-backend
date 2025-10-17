import { Router } from "express";
import SalaryController from "../../../controllers/Admin/salary.controller.js"
const router = Router();
router.post("/generate/:employeeId", SalaryController.generateSalary);
router.get("/get-salaries/:employeeId", SalaryController.listSalaries);
// router.get("/:employeeId", SalaryController.getSalaryByEmployee);
router.put("/:id", SalaryController.updateSalary);
router.get("/details/:salaryId", SalaryController.getSalaryDetails);
router.delete("/delete/:id", SalaryController.deleteSalary);
router.get('/payment-summary/:employeeId',SalaryController.paymentSummary)
export default router