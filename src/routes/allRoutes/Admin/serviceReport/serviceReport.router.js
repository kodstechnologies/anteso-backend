import { Router } from "express";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";
import CTScanRouter from "../serviceReport/CTScan.router.js"
const router = Router();
router.get('/get-details/:serviceId',reportDetailController.getCustomerDetails)
router.use('/ct-scan',CTScanRouter)
export default router;