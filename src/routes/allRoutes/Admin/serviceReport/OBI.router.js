import { Router } from "express";
const router = Router();
import AlignmentTestController from "../../../../controllers/Admin/serviceReport/OBI/AlignmentTest.controller.js";
import AccuracyOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/OBI/AccuracyOfOperatingPotential.controller.js";
import TimerTestController from "../../../../controllers/Admin/serviceReport/OBI/TimerTest.controller.js";
import OutputConsistencyController from "../../../../controllers/Admin/serviceReport/OBI/OutputConsistency.controller.js";
import CentralBeamAlignmentController from "../../../../controllers/Admin/serviceReport/OBI/CentralBeamAlignment.controller.js";
import CongruenceOfRadiationController from "../../../../controllers/Admin/serviceReport/OBI/CongruenceOfRadiation.controller.js";
import EffectiveFocalSpotController from "../../../../controllers/Admin/serviceReport/OBI/EffectiveFocalSpot.controller.js";
import LinearityOfMasLoadingStationsController from "../../../../controllers/Admin/serviceReport/OBI/LinearityOfMasLoadingStations.controller.js";
import LinearityOfTimeController from "../../../../controllers/Admin/serviceReport/OBI/LinearityOfTime.controller.js";
import TubeHousingLeakageController from "../../../../controllers/Admin/serviceReport/OBI/TubeHousingLeakage.controller.js";
import RadiationProtectionController from "../../../../controllers/Admin/serviceReport/OBI/RadiationProtection.controller.js";
import HighContrastSensitivityController from "../../../../controllers/Admin/serviceReport/OBI/HighContrastSensitivity.controller.js";
import LowContrastSensitivityController from "../../../../controllers/Admin/serviceReport/OBI/LowContrastSensitivity.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";

router.get('/report-header/:serviceId', reportDetailController.getReportHeaderOBI)

// 1. Alignment Test
router.post('/alignment-test/:serviceId', AlignmentTestController.create)
router.get('/alignment-test/:testId', AlignmentTestController.getById)
router.put('/alignment-test/:testId', AlignmentTestController.update)
router.get('/alignment-test-by-serviceId/:serviceId', AlignmentTestController.getByServiceId)

// 2. Accuracy of Operating Potential
router.post('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialController.create)
router.get('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.getById)
router.put('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialController.update)
router.get('/accuracy-of-operating-potential-by-serviceId/:serviceId', AccuracyOfOperatingPotentialController.getByServiceId)

// 3. Timer Test
router.post('/timer-test/:serviceId', TimerTestController.create)
router.get('/timer-test/:testId', TimerTestController.getById)
router.put('/timer-test/:testId', TimerTestController.update)
router.get('/timer-test-by-serviceId/:serviceId', TimerTestController.getByServiceId)

// 4. Output Consistency
router.post('/output-consistency/:serviceId', OutputConsistencyController.create)
router.get('/output-consistency/:testId', OutputConsistencyController.getById)
router.put('/output-consistency/:testId', OutputConsistencyController.update)
router.get('/output-consistency-by-serviceId/:serviceId', OutputConsistencyController.getByServiceId)

// 5. Central Beam Alignment
router.post('/central-beam-alignment/:serviceId', CentralBeamAlignmentController.create)
router.get('/central-beam-alignment/:testId', CentralBeamAlignmentController.getById)
router.put('/central-beam-alignment/:testId', CentralBeamAlignmentController.update)
router.get('/central-beam-alignment-by-serviceId/:serviceId', CentralBeamAlignmentController.getByServiceId)

// 6. Congruence of Radiation
router.post('/congruence-of-radiation/:serviceId', CongruenceOfRadiationController.create)
router.get('/congruence-of-radiation/:testId', CongruenceOfRadiationController.getById)
router.put('/congruence-of-radiation/:testId', CongruenceOfRadiationController.update)
router.get('/congruence-of-radiation-by-serviceId/:serviceId', CongruenceOfRadiationController.getByServiceId)

// 7. Effective Focal Spot
router.post('/effective-focal-spot/:serviceId', EffectiveFocalSpotController.create)
router.get('/effective-focal-spot/:testId', EffectiveFocalSpotController.getById)
router.put('/effective-focal-spot/:testId', EffectiveFocalSpotController.update)
router.get('/effective-focal-spot-by-serviceId/:serviceId', EffectiveFocalSpotController.getByServiceId)

// 8. Linearity of mAs Loading Stations
router.post('/linearity-of-mas-loading-stations/:serviceId', LinearityOfMasLoadingStationsController.create)
router.get('/linearity-of-mas-loading-stations/:testId', LinearityOfMasLoadingStationsController.getById)
router.put('/linearity-of-mas-loading-stations/:testId', LinearityOfMasLoadingStationsController.update)
router.get('/linearity-of-mas-loading-stations-by-serviceId/:serviceId', LinearityOfMasLoadingStationsController.getByServiceId)

// 9. Linearity of Time
router.post('/linearity-of-time/:serviceId', LinearityOfTimeController.create)
router.get('/linearity-of-time/:testId', LinearityOfTimeController.getById)
router.put('/linearity-of-time/:testId', LinearityOfTimeController.update)
router.get('/linearity-of-time-by-serviceId/:serviceId', LinearityOfTimeController.getByServiceId)

// 10. Tube Housing Leakage
router.post('/tube-housing-leakage/:serviceId', TubeHousingLeakageController.create)
router.get('/tube-housing-leakage/:testId', TubeHousingLeakageController.getById)
router.put('/tube-housing-leakage/:testId', TubeHousingLeakageController.update)
router.get('/tube-housing-leakage-by-serviceId/:serviceId', TubeHousingLeakageController.getByServiceId)

// 11. Radiation Protection Survey
router.post('/radiation-protection-survey/:serviceId', RadiationProtectionController.create)
router.get('/radiation-protection-survey/:testId', RadiationProtectionController.getById)
router.put('/radiation-protection-survey/:testId', RadiationProtectionController.update)
router.get('/radiation-protection-survey-by-serviceId/:serviceId', RadiationProtectionController.getByServiceId)

// 12. High Contrast Sensitivity
router.post('/high-contrast-sensitivity/:serviceId', HighContrastSensitivityController.create)
router.get('/high-contrast-sensitivity/:testId', HighContrastSensitivityController.getById)
router.put('/high-contrast-sensitivity/:testId', HighContrastSensitivityController.update)
router.get('/high-contrast-sensitivity-by-serviceId/:serviceId', HighContrastSensitivityController.getByServiceId)

// 13. Low Contrast Sensitivity
router.post('/low-contrast-sensitivity/:serviceId', LowContrastSensitivityController.create)
router.get('/low-contrast-sensitivity/:testId', LowContrastSensitivityController.getById)
router.put('/low-contrast-sensitivity/:testId', LowContrastSensitivityController.update)
router.get('/low-contrast-sensitivity-by-serviceId/:serviceId', LowContrastSensitivityController.getByServiceId)

export default router;
