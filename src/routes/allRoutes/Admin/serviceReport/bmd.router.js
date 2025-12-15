import { Router } from "express";
const router = Router();
import AccuracyOfOperatingPotentailAndTimeController from "../../../../controllers/Admin/serviceReport/BMD/AccuracyOfOperatingPotentailAndTime.controller.js";
import LinearityOfmALoading from "../../../../controllers/Admin/serviceReport/BMD/LinearityOfMaLoadingStations.controller.js";
import RadiationLeakageLevel from "../../../../controllers/Admin/serviceReport/BMD/RadiationLeakageLevel.controller.js"
import RadiationProtectionSurveyController from "../../../../controllers/Admin/serviceReport/BMD/RadiationProtectionSurvey.controller.js"
import ReproducibilityOfRadiationOutputController from "../../../../controllers/Admin/serviceReport/BMD/ReproducibilityOfRadiationOutput.controller.js";

import bmdReportController from "../../../../controllers/Admin/serviceReport/BMD/bmdReport.controller.js";

router.put('/report-header/:serviceId', bmdReportController.saveReportHeader)
router.get('/report-header/:serviceId', bmdReportController.getReportHeader)

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