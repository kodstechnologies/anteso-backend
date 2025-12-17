import { Router } from "express";
const router = Router();
import AccuracyOfIrradiationTimeController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/AccuracyOfIrradiationTime.controller.js";
import AccuracyOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/AccuracyOfOperatingPotential.controller.js";
import CentralBeamAlignmentController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/CentralBeamAlignment.controller.js";
import CongruenceOfRadiationController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/CongruenceOfRadiation.controller.js";
import EffectiveFocalSpotController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/EffectiveFocalSpot.controller.js";
import LinearityOfMasLoadingStationsController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/LinearityOfMasLoadingStations.controller.js";
import ConsistencyOfRadiationOutputController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/ConsistencyOfRadiationOutput.controller.js";
import RadiationLeakageLevelController from "../../../../controllers/Admin/serviceReport/RadiographyPortable/RadiationLeakageLevel.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

// Report Header
// router.get('/report-header/:serviceId', reportDetailController.getReportHeaderRadiographyPortable);

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
router.post('/congruence/:serviceId', CongruenceOfRadiationController.create);
router.get('/congruence-by-service/:serviceId', CongruenceOfRadiationController.getByServiceId);
router.put('/congruence/:testId', CongruenceOfRadiationController.update);
router.get('/congruence/:testId', CongruenceOfRadiationController.getById);

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

// Consistency of Radiation Output
router.post('/consistency-of-radiation-output/:serviceId', ConsistencyOfRadiationOutputController.create);
router.get('/consistency-of-radiation-output-by-service/:serviceId', ConsistencyOfRadiationOutputController.getByServiceId);
router.put('/consistency-of-radiation-output/:testId', ConsistencyOfRadiationOutputController.update);
router.get('/consistency-of-radiation-output/:testId', ConsistencyOfRadiationOutputController.getById);

// Radiation Leakage Level
router.post('/radiation-leakage-level/:serviceId', RadiationLeakageLevelController.create);
router.get('/radiation-leakage-level-by-service/:serviceId', RadiationLeakageLevelController.getByServiceId);
router.put('/radiation-leakage-level/:testId', RadiationLeakageLevelController.update);
router.get('/radiation-leakage-level/:testId', RadiationLeakageLevelController.getById);

export default router;
