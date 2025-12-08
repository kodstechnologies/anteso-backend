import { Router } from "express";
const router = Router();
import TotalFilterationForOArmController from "../../../../controllers/Admin/serviceReport/OArm/TotalFilterationForOArm.controller.js";
import OutputConsistencyController from "../../../../controllers/Admin/serviceReport/OArm/OutputConsistency.controller.js";
import HighContrastResolutionController from "../../../../controllers/Admin/serviceReport/OArm/HighContrastResolution.controller.js";
import LowContrastResolution from "../../../../controllers/Admin/serviceReport/OArm/LowContrastResolution.controller.js";
import ExposureRate from "../../../../controllers/Admin/serviceReport/OArm/ExposureRate.controller.js"
import TubeHousing from "../../../../controllers/Admin/serviceReport/OArm/TubeHousingLeakage.controller.js"
import LinearityOfMasLoadingStation from "../../../../controllers/Admin/serviceReport/OArm/LinearityOfMasLoadingStation.controller.js"
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

router.post('/total-filteration/:serviceId', TotalFilterationForOArmController.create)
router.get('/total-filteration-by-service/:serviceId', TotalFilterationForOArmController.getByServiceId)
router.put('/total-filteration/:testId', TotalFilterationForOArmController.update)
router.get('/total-filteration/:testId', TotalFilterationForOArmController.getById)

router.post('/output-consistency/:serviceId', OutputConsistencyController.create)
router.get('/output-consistency-by-service/:serviceId', OutputConsistencyController.getByServiceId)
router.put('/output-consistency/:testId', OutputConsistencyController.update)
router.get('/output-consistency/:testId', OutputConsistencyController.getById)

router.post('/high-contrast-resolution/:serviceId', HighContrastResolutionController.create)
router.get('/high-contrast-resolution-by-service/:serviceId', HighContrastResolutionController.getByServiceId)
router.put('/high-contrast-resolution/:testId', HighContrastResolutionController.update)
router.get('/high-contrast-resolution/:testId', HighContrastResolutionController.getById)

router.post('/low-contrast-resolution/:serviceId', LowContrastResolution.create)
router.get('/low-contrast-resolution-by-service/:serviceId', LowContrastResolution.getByServiceId)
router.put('/low-contrast-resolution/:testId', LowContrastResolution.update)
router.get('/low-contrast-resolution/:testId', LowContrastResolution.getById)

router.post('/exposure-rate/:serviceId', ExposureRate.create)
router.get('/exposure-rate-by-service/:serviceId', ExposureRate.getByServiceId)
router.put('/exposure-rate/:testId', ExposureRate.update)
router.get('/exposure-rate/:testId', ExposureRate.getById)

router.post('/tube-housing/:serviceId', TubeHousing.create)
router.get('/tube-housing-by-service/:serviceId', TubeHousing.getByServiceId)
router.put('/tube-housing/:testId', TubeHousing.update)
router.get('/tube-housing/:testId', TubeHousing.getById)

router.post('/linearity-of-mas-loading-station/:serviceId', LinearityOfMasLoadingStation.create)
router.get('/linearity-of-mas-loading-station-by-service/:serviceId', LinearityOfMasLoadingStation.getByServiceId)
router.put('/linearity-of-mas-loading-station/:testId', LinearityOfMasLoadingStation.update)
router.get('/linearity-of-mas-loading-station/:testId', LinearityOfMasLoadingStation.getById)

// Report Header
router.get('/report-header/:serviceId', reportDetailController.getReportHeaderOArm);

export default router
