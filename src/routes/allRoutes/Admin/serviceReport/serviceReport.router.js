import { Router } from "express";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";
import CTScanRouter from "../serviceReport/CTScan.router.js"
import InventionalRadiology from "../serviceReport/InventionalRadiology.router.js"
import Mammography from "../serviceReport/Mammography.router.js"
import CArm from "../serviceReport/CArm.router.js"
import FixedRadioFluro from "../serviceReport/FixedRadioFluro.router.js"
import BMD from "../serviceReport/bmd.router.js"
const  router = Router();
router.get('/get-details/:serviceId', reportDetailController.getCustomerDetails)
router.get('/get-tools/:serviceId', reportDetailController.getTools)
router.put('/report-header/:serviceId', reportDetailController.saveReportHeader)
router.get('/report-header/:serviceId', reportDetailController.getReportHeader)

// router.get('/get-tools-for-technician-assigned/:serviceId',reportDetailController.)
router.use('/ct-scan', CTScanRouter)
router.use('/inventional-radiology', InventionalRadiology)
router.use('/mammography',Mammography)
router.use('/c-arm',CArm)
router.use('/fixed-radio-fluro', FixedRadioFluro)
router.use('/bmd', BMD)

export default router;