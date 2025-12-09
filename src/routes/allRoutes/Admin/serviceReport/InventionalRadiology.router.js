import { Router } from "express";
const router = Router();
import AccuracyOfIrradiationTime from "../../../../controllers/Admin/serviceReport/InventionalRadiology/AccuracyOfIrradiationTime.js";
import TotalFilterationForInventionalRadiologyController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/TotalFilterationForInventionalRadiology.controller.js";
import ExposureRateAtTableTop from "../../../../controllers/Admin/serviceReport/InventionalRadiology/ExposureRateAtTableTop.js";
import LowContrastResolutionController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/LowContrastResolution.controller.js";
import HighContrastResolutionController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/HighContrastResolution.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

router.post('/accuracy-of-irradiation-time/:serviceId', AccuracyOfIrradiationTime.create)
router.get('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTime.getById)
router.put('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTime.update)
router.get('/accuracy-of-irradiation-time-by-service/:serviceId', AccuracyOfIrradiationTime.getByServiceId)

router.post('/total-filteration/:serviceId', TotalFilterationForInventionalRadiologyController.create)
router.get('/total-filteration/:testId', TotalFilterationForInventionalRadiologyController.getById)
router.put('/total-filteration/:testId', TotalFilterationForInventionalRadiologyController.update)

router.post('/exposure-rate/:serviceId', ExposureRateAtTableTop.create)
router.get('/exposure-rate/:testId', ExposureRateAtTableTop.getById)
router.put('/exposure-rate/:testId', ExposureRateAtTableTop.update)


router.post('/low-contrast-resolution/:serviceId', LowContrastResolutionController.create)
router.get('/low-contrast-resolution/:serviceId', LowContrastResolutionController.getById)
router.put('/low-contrast-resolution/:testId', LowContrastResolutionController.update)

router.post('/high-contrast-resolution/:serviceId', HighContrastResolutionController.create)
router.get('/high-contrast-resolution/:serviceId', HighContrastResolutionController.getById)
router.put('/high-contrast-resolution/:testId', HighContrastResolutionController.update)

router.get('/report-header/:serviceId', reportDetailController.getReportHeaderInventionalRadiology)

export default router