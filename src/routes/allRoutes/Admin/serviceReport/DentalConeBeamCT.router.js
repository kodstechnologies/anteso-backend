import { Router } from "express";
const router = Router();
import AccuracyOfIrradiationTimeController from "../../../../controllers/Admin/serviceReport/DentalConeBeamCT/AccuracyOfIrradiationTime.controller.js";
import AccuracyOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/DentalConeBeamCT/AccuracyOfOperatingPotential.controller.js";
import ConsistencyOfRadiationOutputController from "../../../../controllers/Admin/serviceReport/DentalConeBeamCT/ConsistencyOfRadiationOutput.controller.js";
import LinearityOfmALoadingController from "../../../../controllers/Admin/serviceReport/DentalConeBeamCT/LinearityOfmALoading.controller.js";
import RadiationLeakagelevelController from "../../../../controllers/Admin/serviceReport/DentalConeBeamCT/RadiationLeakagelevel.controller.js";
import RadiationProtectionSurveyController from "../../../../controllers/Admin/serviceReport/DentalConeBeamCT/RadiationProtectionSurvey.controller.js";

// 1. Accuracy of Irradiation Time
router.post('/accuracy-of-irradiation-time/:serviceId', AccuracyOfIrradiationTimeController.create)
router.get('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.getById)
router.put('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.update)
router.get('/accuracy-of-irradiation-time-by-serviceId/:serviceId', AccuracyOfIrradiationTimeController.getByServiceId)

// 2. Accuracy of Operating Potential
router.post('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialController.create)
router.get('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.getById)
router.put('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.update)
router.get('/accuracy-of-operating-potential-by-serviceId/:serviceId', AccuracyOfOperatingPotentialController.getByServiceId)

// 3. Consistency of Radiation Output
router.post('/consistency-of-radiation-output/:serviceId', ConsistencyOfRadiationOutputController.create)
router.get('/consistency-of-radiation-output/:testId', ConsistencyOfRadiationOutputController.getById)
router.put('/consistency-of-radiation-output/:testId', ConsistencyOfRadiationOutputController.update)
router.get('/consistency-of-radiation-output-by-serviceId/:serviceId', ConsistencyOfRadiationOutputController.getByServiceId)

// 4. Linearity of mA Loading
router.post('/linearity-of-ma-loading/:serviceId', LinearityOfmALoadingController.create)
router.get('/linearity-of-ma-loading/:testId', LinearityOfmALoadingController.getById)
router.put('/linearity-of-ma-loading/:testId', LinearityOfmALoadingController.update)
router.get('/linearity-of-ma-loading-by-serviceId/:serviceId', LinearityOfmALoadingController.getByServiceId)

// 5. Radiation Leakage Level
router.post('/radiation-leakage-level/:serviceId', RadiationLeakagelevelController.create)
router.get('/radiation-leakage-level/:testId', RadiationLeakagelevelController.getById)
router.put('/radiation-leakage-level/:testId', RadiationLeakagelevelController.update)
router.get('/radiation-leakage-level-by-serviceId/:serviceId', RadiationLeakagelevelController.getByServiceId)

// 6. Radiation Protection Survey
router.post('/radiation-protection-survey/:serviceId', RadiationProtectionSurveyController.create)
router.get('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.getById)
router.put('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.update)
router.get('/radiation-protection-survey-by-serviceId/:serviceId', RadiationProtectionSurveyController.getByServiceId)

export default router;

