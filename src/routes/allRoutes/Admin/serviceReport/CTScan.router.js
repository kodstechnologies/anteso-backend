import { Router } from "express";
const router = Router();
import CTScanController from '../../../../controllers/Admin/serviceReport/ctScan.controller.js'
router.post('/radiation-profile-width/:serviceId', CTScanController.createRadiationProfileWidth)
router.get('/radiation-profile-width/:id',CTScanController.getById)
router.put('/radiation-profile-width/:serviceId',CTScanController.updateRadiationProfileWidth)
export default router