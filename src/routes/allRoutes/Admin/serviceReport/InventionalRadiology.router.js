import { Router } from "express";
const router = Router();
import AccuracyOfIrradiationTime from "../../../../controllers/Admin/serviceReport/InventionalRadiology/AccuracyOfIrradiationTime.js";
import TotalFilterationForInventionalRadiologyController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/TotalFilterationForInventionalRadiology.controller.js";
import ExposureRateTableTopController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/ExposureRateTableTop.controller.js";
import LowContrastResolutionController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/LowContrastResolution.controller.js";
import HighContrastResolutionController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/HighContrastResolution.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";
import CentralBeamAlignmentController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/CentralBeamAlignment.controller.js";
import EffectiveFocalSpotController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/EffectiveFocalSpot.controller.js";
// import LinearityOfmAsLoadingController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/LinearityOfmAsLoading.controller.js";
import ConsistencyOfRadiationOutputController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/ConsistencyOfRadiationOutput.controller.js";
import RadiationProtectionSurveyController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/RadiationProtectionSurvey.controller.js";
import AccuracyOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/AccuracyOfOperatingPotential.controller.js";
import TubeHousingLeakageController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/TubeHousingLeakage.controller.js";
import TimerAccuracyController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/timerAccuracy.controller.js";
import MeasurementOfMaLinearityController from "../../../../controllers/Admin/serviceReport/InventionalRadiology/measurementOfMaLinearity.controller.js";

router.get('/report-header/:serviceId', reportDetailController.getReportHeaderInventionalRadiology)

router.post('/accuracy-of-irradiation-time/:serviceId', AccuracyOfIrradiationTime.create)
router.get('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTime.getById)
router.put('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTime.update)
router.get('/accuracy-of-irradiation-time-by-service/:serviceId', AccuracyOfIrradiationTime.getByServiceId)

router.post('/total-filteration/:serviceId', TotalFilterationForInventionalRadiologyController.create)
router.get('/total-filteration/:testId', TotalFilterationForInventionalRadiologyController.getById)
router.put('/total-filteration/:testId', TotalFilterationForInventionalRadiologyController.update)
router.get('/total-filteration-by-service/:serviceId', TotalFilterationForInventionalRadiologyController.getByServiceId)

router.post('/exposure-rate/:serviceId', ExposureRateTableTopController.create)
router.get('/exposure-rate/:testId', ExposureRateTableTopController.getById)
router.put('/exposure-rate/:testId', ExposureRateTableTopController.update)
router.get('/exposure-rate-by-service/:serviceId', ExposureRateTableTopController.getByServiceId)



router.post('/low-contrast-resolution/:serviceId', LowContrastResolutionController.create)
router.get('/low-contrast-resolution/:serviceId', LowContrastResolutionController.getByServiceId)
router.put('/low-contrast-resolution/:testId', LowContrastResolutionController.update)

router.post('/high-contrast-resolution/:serviceId', HighContrastResolutionController.create)
router.get('/high-contrast-resolution/:serviceId', HighContrastResolutionController.getByServiceId)
router.put('/high-contrast-resolution/:testId', HighContrastResolutionController.update)

// router.get('/report-header/:serviceId', reportDetailController.getReportHeaderInventionalRadiology)


router.post('/central-beam-alignment/:serviceId', CentralBeamAlignmentController.create);
router.get('/central-beam-alignment-by-service/:serviceId', CentralBeamAlignmentController.getByServiceId);
router.put('/central-beam-alignment/:testId', CentralBeamAlignmentController.update);
router.get('/central-beam-alignment/:testId', CentralBeamAlignmentController.getById);

router.post('/effective-focal-spot/:serviceId', EffectiveFocalSpotController.create);
router.get('/effective-focal-spot-by-service/:serviceId', EffectiveFocalSpotController.getByServiceId);
router.put('/effective-focal-spot/:testId', EffectiveFocalSpotController.update);
router.get('/effective-focal-spot/:testId', EffectiveFocalSpotController.getById);

router.post('/consistency-of-radiation-output/:serviceId', ConsistencyOfRadiationOutputController.create);
router.get('/consistency-of-radiation-output-by-service/:serviceId', ConsistencyOfRadiationOutputController.getByServiceId);
router.put('/consistency-of-radiation-output/:testId', ConsistencyOfRadiationOutputController.update);
router.get('/consistency-of-radiation-output/:testId', ConsistencyOfRadiationOutputController.getById);

router.post('/radiation-protection-survey/:serviceId', RadiationProtectionSurveyController.create);
router.get('/radiation-protection-survey-by-service/:serviceId', RadiationProtectionSurveyController.getByServiceId);

router.post('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialController.create);
router.get('/accuracy-of-operating-potential-by-service/:serviceId', AccuracyOfOperatingPotentialController.getByServiceId);
router.get('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.getById);
router.put('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.update);

router.post('/tube-housing-leakage/:serviceId', TubeHousingLeakageController.create);
router.get('/tube-housing-leakage-by-service/:serviceId', TubeHousingLeakageController.getByServiceId);
router.get('/tube-housing-leakage/:testId', TubeHousingLeakageController.getById);
router.put('/tube-housing-leakage/:testId', TubeHousingLeakageController.update);

// CTScan-style tables for IR
router.post('/timer-accuracy/:serviceId', TimerAccuracyController.create);
router.get('/timer-accuracy/:testId', TimerAccuracyController.getById);
router.put('/timer-accuracy/:testId', TimerAccuracyController.update);
router.get('/timer-accuracy/service/:serviceId', TimerAccuracyController.getByServiceId);

router.post('/measurement-of-ma-linearity/:serviceId', MeasurementOfMaLinearityController.create);
router.get('/measurement-of-ma-linearity/:testId', MeasurementOfMaLinearityController.getById);
router.put('/measurement-of-ma-linearity/:testId', MeasurementOfMaLinearityController.update);
router.get('/measurement-of-ma-linearity/service/:serviceId', MeasurementOfMaLinearityController.getByServiceId);

export default router;