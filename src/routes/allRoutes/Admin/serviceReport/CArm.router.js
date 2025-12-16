import { Router } from "express";
const router = Router();
import TotalFilterationForCArmController from "../../../../controllers/Admin/serviceReport/CArm/TotalFilterationForCArm.controller.js";
import OutputConsistencyController from "../../../../controllers/Admin/serviceReport/CArm/OutputConsistency.controller.js";
import HighContrastResolutionController from "../../../../controllers/Admin/serviceReport/CArm/HighContrastResolution.controller.js";
import LowContrastResolution from "../../../../controllers/Admin/serviceReport/CArm/LowContrastResolution.controller.js";
import ExposureRate from "../../../../controllers/Admin/serviceReport/CArm/ExposureRate.controller.js"
import TubeHousing from "../../../../controllers/Admin/serviceReport/CArm/TubeHousingLeakage.controller.js"
import AccuracyOfIrradiationTimeController from "../../../../controllers/Admin/serviceReport/CArm/AccuracyOfIrradiationTime.controller.js"
import LinearityOfMasLoadingStationController from "../../../../controllers/Admin/serviceReport/CArm/LinearityOfMasLoadingStation.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

router.post('/accuracy-of-irradiation-time/:serviceId', AccuracyOfIrradiationTimeController.create)
router.get('/accuracy-of-irradiation-time-by-service/:serviceId', AccuracyOfIrradiationTimeController.getByServiceId)
router.put('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.update)
router.get('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.getById)

router.post('/total-filteration/:serviceId', TotalFilterationForCArmController.create)
router.get('/total-filteration-by-service/:serviceId', TotalFilterationForCArmController.getByServiceId)
router.put('/total-filteration/:testId', TotalFilterationForCArmController.update)
router.get('/total-filteration/:testId', TotalFilterationForCArmController.getById)

router.post('/output-consistency/:serviceId', OutputConsistencyController.create)
router.get('/output-consistency-by-service/:serviceId', OutputConsistencyController.getByServiceId)
router.put('/output-consistency/:testId', OutputConsistencyController.update)
router.get('/output-consistency/:testId', OutputConsistencyController.getById)

// Linearity of mAs Loading Stations
router.post('/linearity-of-mas-loading-stations/:serviceId', LinearityOfMasLoadingStationController.create)
router.get('/linearity-of-mas-loading-stations-by-service/:serviceId', LinearityOfMasLoadingStationController.getByServiceId)
router.put('/linearity-of-mas-loading-stations/:testId', LinearityOfMasLoadingStationController.update)
router.get('/linearity-of-mas-loading-stations/:testId', LinearityOfMasLoadingStationController.getById)

// Linearity of mA Loading Stations (same controller/model)
router.post('/linearity-of-ma-loading-stations/:serviceId', LinearityOfMasLoadingStationController.create)
router.get('/linearity-of-ma-loading-stations-by-service/:serviceId', LinearityOfMasLoadingStationController.getByServiceId)
router.put('/linearity-of-ma-loading-stations/:testId', LinearityOfMasLoadingStationController.update)
router.get('/linearity-of-ma-loading-stations/:testId', LinearityOfMasLoadingStationController.getById)

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

// Report Header
// router.get('/report-header/:serviceId', reportDetailController.getReportHeaderCArm);

export default router