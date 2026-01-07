import { Router } from "express";
const router = Router();
import AccuracyOfOperatingPotentailAndTimeController from "../../../../controllers/Admin/serviceReport/BMD/AccuracyOfOperatingPotentailAndTime.controller.js";
import AccuracyOfIrradiationTimeController from "../../../../controllers/Admin/serviceReport/BMD/AccuracyOfIrradiationTime.controller.js";
import AccuracyOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/BMD/AccuracyOfOperatingPotential.controller.js";
import TotalFilterationController from "../../../../controllers/Admin/serviceReport/BMD/TotalFilteration.controller.js";
import LinearityOfmALoading from "../../../../controllers/Admin/serviceReport/BMD/LinearityOfMaLoadingStations.controller.js";
import RadiationLeakageLevel from "../../../../controllers/Admin/serviceReport/BMD/RadiationLeakageLevel.controller.js"
import RadiationProtectionSurveyController from "../../../../controllers/Admin/serviceReport/BMD/RadiationProtectionSurvey.controller.js"
import ReproducibilityOfRadiationOutputController from "../../../../controllers/Admin/serviceReport/BMD/ReproducibilityOfRadiationOutput.controller.js";

import bmdReportController from "../../../../controllers/Admin/serviceReport/BMD/bmdReport.controller.js";

router.put('/report-header/:serviceId', bmdReportController.saveReportHeader)
router.get('/report-header/:serviceId', bmdReportController.getReportHeader)

// Accuracy of Irradiation Time
router.post('/accuracy-of-irradiation-time/:serviceId', AccuracyOfIrradiationTimeController.create);
router.get('/accuracy-of-irradiation-time-by-service/:serviceId', AccuracyOfIrradiationTimeController.getByServiceId);
router.put('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.update);
router.get('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.getById);

// Accuracy of Operating Potential
router.post('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialController.create);
router.get('/accuracy-of-operating-potential-by-service/:serviceId', AccuracyOfOperatingPotentialController.getByServiceId);
router.put('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.update);
router.get('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.getById);

// Total Filtration
router.post('/total-filtration/:serviceId', TotalFilterationController.create);
router.get('/total-filtration-by-service/:serviceId', TotalFilterationController.getByServiceId);
router.put('/total-filtration/:testId', TotalFilterationController.update);
router.get('/total-filtration/:testId', TotalFilterationController.getById);

router.post('/accuracy-of-operating-potential-and-time/:serviceId', AccuracyOfOperatingPotentailAndTimeController.create)
router.get('/accuracy-of-operating-potential-and-time/:testId', AccuracyOfOperatingPotentailAndTimeController.getById)
router.put('/accuracy-of-operating-potential-and-time/:testId', AccuracyOfOperatingPotentailAndTimeController.update)
router.get('/accuracy-of-operating-potential-and-time-by-serviceId/:serviceId', AccuracyOfOperatingPotentailAndTimeController.getByServiceId)

router.post('/linearity-of-mas-loading/:serviceId', LinearityOfmALoading.create)
router.get('/linearity-of-mas-loading/:testId', LinearityOfmALoading.getById)
router.put('/linearity-of-mas-loading/:testId', LinearityOfmALoading.update)
router.get('/linearity-of-mas-loading-by-serviceId/:serviceId', LinearityOfmALoading.getByServiceId)

router.post('/radiation-leakage-level/:serviceId', RadiationLeakageLevel.create)
router.get('/radiation-leakage-level/:testId', RadiationLeakageLevel.getById)
router.put('/radiation-leakage-level/:testId', RadiationLeakageLevel.update)
router.get('/radiation-leakage-level-by-serviceId/:serviceId', RadiationLeakageLevel.getByServiceId)

router.post('/radiation-protection-survey/:serviceId', RadiationProtectionSurveyController.create)
router.get('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.getById)
router.put('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.update)
router.get('/radiation-protection-survey-by-serviceId/:serviceId', RadiationProtectionSurveyController.getByServiceId)


router.post('/reproducibility-of-radiation-output/:serviceId', ReproducibilityOfRadiationOutputController.create)
router.get('/reproducibility-of-radiation-output/:testId', ReproducibilityOfRadiationOutputController.getById)
router.put('/reproducibility-of-radiation-output/:testId', ReproducibilityOfRadiationOutputController.update)
router.get('/reproducibility-of-radiation-output-by-serviceId/:serviceId', ReproducibilityOfRadiationOutputController.getByServiceId)


export default router