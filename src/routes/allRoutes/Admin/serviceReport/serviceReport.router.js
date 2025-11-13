import { Router } from "express";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";
import CTScanRouter from "../serviceReport/CTScan.router.js"
const router = Router();
router.get('/get-details/:serviceId',reportDetailController.getCustomerDetails)
router.get('/get-tools/:serviceId',reportDetailController.getTools)

// router.get('/get-tools-for-technician-assigned/:serviceId',reportDetailController.)
router.use('/ct-scan',CTScanRouter)
export default router;