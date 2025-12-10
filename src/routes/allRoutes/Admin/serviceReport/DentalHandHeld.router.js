import { Router } from "express";
const router = Router();
import AccuracyOfOperatingPotentialAndTimeController from "../../../../controllers/Admin/serviceReport/DentalHandHeld/AccuracyOfOperatingPotentialAndTime.controller.js";
import LinearityOfTimeController from "../../../../controllers/Admin/serviceReport/DentalHandHeld/LinearityOfTime.controller.js";
import ReproducibilityOfRadiationOutputController from "../../../../controllers/Admin/serviceReport/DentalHandHeld/ReproducibilityOfRadiationOutput.controller.js";
import TubeHousingLeakageController from "../../../../controllers/Admin/serviceReport/DentalHandHeld/TubeHousingLeakage.controller.js";
import RadiationLeakagelevelController from "../../../../controllers/Admin/serviceReport/DentalHandHeld/RadiationLeakagelevel.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

router.get('/report-header/:serviceId', reportDetailController.getReportHeaderDentalHandHeld)

router.post('/accuracy-of-operating-potential-and-time/:serviceId', AccuracyOfOperatingPotentialAndTimeController.create)
router.get('/accuracy-of-operating-potential-and-time-by-service/:serviceId', AccuracyOfOperatingPotentialAndTimeController.getByServiceId)
router.put('/accuracy-of-operating-potential-and-time/:testId', AccuracyOfOperatingPotentialAndTimeController.update)
router.get('/accuracy-of-operating-potential-and-time/:testId', AccuracyOfOperatingPotentialAndTimeController.getById)

router.post('/linearity-of-time/:serviceId', LinearityOfTimeController.create)
router.get('/linearity-of-time-by-service/:serviceId', LinearityOfTimeController.getByServiceId)
router.put('/linearity-of-time/:testId', LinearityOfTimeController.update)
router.get('/linearity-of-time/:testId', LinearityOfTimeController.getById)

router.post('/reproducibility-of-radiation-output/:serviceId', ReproducibilityOfRadiationOutputController.create)
router.get('/reproducibility-of-radiation-output-by-service/:serviceId', ReproducibilityOfRadiationOutputController.getByServiceId)
router.put('/reproducibility-of-radiation-output/:testId', ReproducibilityOfRadiationOutputController.update)
router.get('/reproducibility-of-radiation-output/:testId', ReproducibilityOfRadiationOutputController.getById)

router.post('/tube-housing-leakage/:serviceId', TubeHousingLeakageController.create)
router.get('/tube-housing-leakage-by-service/:serviceId', TubeHousingLeakageController.getByServiceId)
router.put('/tube-housing-leakage/:testId', TubeHousingLeakageController.update)
router.get('/tube-housing-leakage/:testId', TubeHousingLeakageController.getById)

// Radiation Leakage Level
router.post('/radiation-leakage-level/:serviceId', RadiationLeakagelevelController.create)
router.get('/radiation-leakage-level/:testId', RadiationLeakagelevelController.getById)
router.put('/radiation-leakage-level/:testId', RadiationLeakagelevelController.update)
router.get('/radiation-leakage-level-by-serviceId/:serviceId', RadiationLeakagelevelController.getByServiceId)

export default router;
