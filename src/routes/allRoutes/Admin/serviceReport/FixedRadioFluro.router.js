import { Router } from "express";
const router = Router();
import AccuracyOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/AccuracyOfOperatingPotential.controller.js";
import TotalFilterationController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/TotalFilteration.controller.js";
import OutputConsistencyController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/OutputConsistency.controller.js";
import HighContrastResolutionController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/HighContrastResolution.controller.js";
import LowContrastResolutionController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/LowContrastResolution.controller.js";
import ExposureRateController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/ExposureRate.controller.js";
import CongruenceController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/Congruence.controller.js";
import CentralBeamAlignmentController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/CentralBeamAlignment.controller.js";
import EffectiveFocalSpotController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/EffectiveFocalSpot.controller.js";
import TubeHousingController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/TubeHousing.controller.js";
import AccuracyOfIrradiationTimeController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/AccuracyOfIrradiationTime.controller.js";
import LinearityOfmAsLoadingStationsController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/LinearityOfmAsLoadingStations.controller.js";
import RadiationProtectionSurveyController from "../../../../controllers/Admin/serviceReport/FixedRadioFluro/RadiationProtectionSurvey.controller.js";

// Accuracy of Operating Potential
router.post('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialController.create)
router.get('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.getById)
router.put('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.update)
router.get('/accuracy-of-operating-potential-by-serviceId/:serviceId', AccuracyOfOperatingPotentialController.getByServiceId)

// Total Filtration
router.post('/total-filteration/:serviceId', TotalFilterationController.create)
router.get('/total-filteration-by-serviceId/:serviceId', TotalFilterationController.getByServiceId)
router.put('/total-filteration/:testId', TotalFilterationController.update)
router.get('/total-filteration/:testId', TotalFilterationController.getById)

// Output Consistency
router.post('/output-consistency/:serviceId', OutputConsistencyController.create)
router.get('/output-consistency-by-service/:serviceId', OutputConsistencyController.getByServiceId)
router.put('/output-consistency/:testId', OutputConsistencyController.update)
router.get('/output-consistency/:testId', OutputConsistencyController.getById)

// High Contrast Resolution
router.post('/high-contrast-resolution/:serviceId', HighContrastResolutionController.create)
router.get('/high-contrast-resolution-by-service/:serviceId', HighContrastResolutionController.getByServiceId)
router.put('/high-contrast-resolution/:testId', HighContrastResolutionController.update)
router.get('/high-contrast-resolution/:testId', HighContrastResolutionController.getById)

// Low Contrast Resolution
router.post('/low-contrast-resolution/:serviceId', LowContrastResolutionController.create)
router.get('/low-contrast-resolution-by-service/:serviceId', LowContrastResolutionController.getByServiceId)
router.put('/low-contrast-resolution/:testId', LowContrastResolutionController.update)
router.get('/low-contrast-resolution/:testId', LowContrastResolutionController.getById)

// Exposure Rate
router.post('/exposure-rate/:serviceId', ExposureRateController.create)
router.get('/exposure-rate-by-service/:serviceId', ExposureRateController.getByServiceId)
router.put('/exposure-rate/:testId', ExposureRateController.update)
router.get('/exposure-rate/:testId', ExposureRateController.getById)

// Congruence
router.post('/congruence/:serviceId', CongruenceController.create)
router.get('/congruence-by-service/:serviceId', CongruenceController.getByServiceId)
router.put('/congruence/:testId', CongruenceController.update)
router.get('/congruence/:testId', CongruenceController.getById)

// Central Beam Alignment
router.post('/central-beam-alignment/:serviceId', CentralBeamAlignmentController.create)
router.get('/central-beam-alignment-by-service/:serviceId', CentralBeamAlignmentController.getByServiceId)
router.put('/central-beam-alignment/:testId', CentralBeamAlignmentController.update)
router.get('/central-beam-alignment/:testId', CentralBeamAlignmentController.getById)

// Effective Focal Spot
router.post('/effective-focal-spot/:serviceId', EffectiveFocalSpotController.create)
router.get('/effective-focal-spot-by-service/:serviceId', EffectiveFocalSpotController.getByServiceId)
router.put('/effective-focal-spot/:testId', EffectiveFocalSpotController.update)
router.get('/effective-focal-spot/:testId', EffectiveFocalSpotController.getById)

// Accuracy of Irradiation Time (Fixed Radio Fluoro)
router.post('/accuracy-of-irradiation-time/:serviceId', AccuracyOfIrradiationTimeController.create)
router.get('/accuracy-of-irradiation-time-by-service/:serviceId', AccuracyOfIrradiationTimeController.getByServiceId)
router.put('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.update)
router.get('/accuracy-of-irradiation-time/:testId', AccuracyOfIrradiationTimeController.getById)

// Linearity of mAs Loading (Stations) - Fixed Radio Fluoro
router.post('/linearity-of-mas-loading-stations/:serviceId', LinearityOfmAsLoadingStationsController.create)
router.get('/linearity-of-mas-loading-stations-by-service/:serviceId', LinearityOfmAsLoadingStationsController.getByServiceId)
router.put('/linearity-of-mas-loading-stations/:testId', LinearityOfmAsLoadingStationsController.update)
router.get('/linearity-of-mas-loading-stations/:testId', LinearityOfmAsLoadingStationsController.getById)

// Radiation Protection Survey - Fixed Radio Fluoro
router.post('/radiation-protection-survey/:serviceId', RadiationProtectionSurveyController.create)
router.get('/radiation-protection-survey-by-service/:serviceId', RadiationProtectionSurveyController.getByServiceId)
router.put('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.update)
router.get('/radiation-protection-survey/:testId', RadiationProtectionSurveyController.getById)

// Tube Housing
router.post('/tube-housing/:serviceId', TubeHousingController.create)
router.get('/tube-housing-by-service/:serviceId', TubeHousingController.getByServiceId)
router.put('/tube-housing/:testId', TubeHousingController.update)
router.get('/tube-housing/:testId', TubeHousingController.getById)

export default router;


