import { Router } from "express";
const router = Router();
import LeadApronTestController from "../../../../controllers/Admin/serviceReport/LeadApron/LeadApronTest.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

// Report Header Routes
router.get('/report-header/:serviceId', reportDetailController.getReportHeaderLeadApron);
router.put('/report-header/:serviceId', reportDetailController.saveReportHeaderLeadApron);

// Lead Apron Test Routes
router.post('/lead-apron-test/:serviceId', LeadApronTestController.create);
router.get('/lead-apron-test/:testId', LeadApronTestController.getById);
router.put('/lead-apron-test/:testId', LeadApronTestController.update);
router.get('/lead-apron-test-by-serviceId/:serviceId', LeadApronTestController.getByServiceId);

export default router;

