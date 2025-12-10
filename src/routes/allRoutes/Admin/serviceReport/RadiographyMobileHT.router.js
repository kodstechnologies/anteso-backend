import { Router } from "express";
const router = Router();
import AccuracyOfIrradiationTimeController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/AccuracyOfIrradiationTime.controller.js";
import AccuracyOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/AccuracyOfOperatingPotential.controller.js";
import CentralBeamAlignmentController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/CentralBeamAlignment.controller.js";
import CongruenceController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/Congruence.controller.js";
import EffectiveFocalSpotController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/EffectiveFocalSpot.controller.js";
import LinearityOfMasLoadingStationsController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/LinearityOfMasLoadingStations.controller.js";
import OutputConsistencyController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/OutputConsistency.controller.js";
import RadiationLeakageLevelController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/RadiationLeakageLevel.controller.js";
import RadiationProtectionSurveyController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/RadiationProtectionSurvey.controller.js";
import TotalFilterationController from "../../../../controllers/Admin/serviceReport/RadiographyMobileHT/TotalFilteration.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

// Report Header
router.get('/report-header/:serviceId', reportDetailController.getReportHeaderRadiographyMobileHT);

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

// Central Beam Alignment
router.post('/central-beam-alignment/:serviceId', CentralBeamAlignmentController.create);
router.get('/central-beam-alignment-by-service/:serviceId', CentralBeamAlignmentController.getByServiceId);
router.put('/central-beam-alignment/:testId', CentralBeamAlignmentController.update);
router.get('/central-beam-alignment/:testId', CentralBeamAlignmentController.getById);

// Congruence
router.post('/congruence/:serviceId', CongruenceController.create);
router.get('/congruence-by-service/:serviceId', CongruenceController.getByServiceId);
router.put('/congruence/:testId', CongruenceController.update);
router.get('/congruence/:testId', CongruenceController.getById);

// Effective Focal Spot
router.post('/effective-focal-spot/:serviceId', EffectiveFocalSpotController.create);
router.get('/effective-focal-spot-by-service/:serviceId', EffectiveFocalSpotController.getByServiceId);
router.put('/effective-focal-spot/:testId', EffectiveFocalSpotController.update);
router.get('/effective-focal-spot/:testId', EffectiveFocalSpotController.getById);

// Linearity of mAs Loading Stations
router.post('/linearity-of-mas-loading-stations/:serviceId', LinearityOfMasLoadingStationsController.create);
router.get('/linearity-of-mas-loading-stations-by-service/:serviceId', LinearityOfMasLoadingStationsController.getByServiceId);
router.put('/linearity-of-mas-loading-stations/:testId', LinearityOfMasLoadingStationsController.update);
router.get('/linearity-of-mas-loading-stations/:testId', LinearityOfMasLoadingStationsController.getById);

// Output Consistency
router.post('/output-consistency/:serviceId', OutputConsistencyController.create);
router.get('/output-consistency-by-service/:serviceId', OutputConsistencyController.getByServiceId);
router.put('/output-consistency/:testId', OutputConsistencyController.update);
router.get('/output-consistency/:testId', OutputConsistencyController.getById);

// Radiation Leakage Level
router.post('/radiation-leakage-level/:serviceId', RadiationLeakageLevelController.create);
router.get('/radiation-leakage-level-by-service/:serviceId', RadiationLeakageLevelController.getByServiceId);
router.put('/radiation-leakage-level/:testId', RadiationLeakageLevelController.update);
router.get('/radiation-leakage-level/:testId', RadiationLeakageLevelController.getById);

// Radiation Protection Survey
router.post('/radiation-protection-survey/:serviceId', RadiationProtectionSurveyController.create);
router.get('/radiation-protection-survey-by-service/:serviceId', RadiationProtectionSurveyController.getByServiceId);
router.put('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.update);
router.get('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.getById);

// Total Filtration
router.post('/total-filtration/:serviceId', TotalFilterationController.create);
router.get('/total-filtration-by-service/:serviceId', TotalFilterationController.getByServiceId);
router.put('/total-filtration/:testId', TotalFilterationController.update);
router.get('/total-filtration/:testId', TotalFilterationController.getById);

export default router;
