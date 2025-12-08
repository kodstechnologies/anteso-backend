import { Router } from "express";
const router = Router();
import radiationProfileWidthController from '../../../../controllers/Admin/serviceReport/CTScan/radiationProfileWidth.controller.js'
import measurementOfOperatingPotentialController from "../../../../controllers/Admin/serviceReport/CTScan/measurementOfOperatingPotential.controller.js";
import timerAccuracyController from "../../../../controllers/Admin/serviceReport/CTScan/timerAccuracy.controller.js";
import measurementOfCTDIController from "../../../../controllers/Admin/serviceReport/CTScan/measurementOfCTDI.controller.js";
import totalFilterationForCTScan from "../../../../controllers/Admin/serviceReport/CTScan/totalFilterationForCTScan.controller.js"
import measurementOfMaLinearityController from "../../../../controllers/Admin/serviceReport/CTScan/measurementOfMaLinearity.controller.js";
import outputConsistencyController from "../../../../controllers/Admin/serviceReport/CTScan/outputConsistency.controller.js";
import radiationLeakageLevelFromXRayTubeHouseController from "../../../../controllers/Admin/serviceReport/CTScan/radiationLeakageLevelFromXRayTubeHouse.controller.js";
import measureMaxRadiationLevelControler from "../../../../controllers/Admin/serviceReport/CTScan/measureMaxRadiationLevel.controler.js";
import lowContrastResolutionForCTScanController from "../../../../controllers/Admin/serviceReport/CTScan/lowContrastResolutionForCTScan.controller.js";
import highContrastResolutionForCTScanController from "../../../../controllers/Admin/serviceReport/CTScan/highContrastResolutionForCTScan.controller.js";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";


router.post('/radiation-profile-width/:serviceId', radiationProfileWidthController.create)
router.get('/radiation-profile-width/service/:serviceId', radiationProfileWidthController.getByServiceId);
router.get('/radiation-profile-width/:id', radiationProfileWidthController.getById)
router.put('/radiation-profile-width/:testId', radiationProfileWidthController.update)

router.post('/measurement-of-operating-potential/:serviceId', measurementOfOperatingPotentialController.create)
router.get('/measurement-of-operating-potential/:testId', measurementOfOperatingPotentialController.getById)
router.get('/measurement-of-operating-potential/service/:serviceId', measurementOfOperatingPotentialController.getByServiceId)
router.put('/measurement-of-operating-potential/:testId', measurementOfOperatingPotentialController.update)

router.post('/timer-accuracy/:serviceId', timerAccuracyController.create)
router.get('/timer-accuracy/:testId', timerAccuracyController.getById)
router.get('/timer-accuracy/service/:serviceId', timerAccuracyController.getByServiceId)
router.put('/timer-accuracy/:testId', timerAccuracyController.update)

router.post('/measurement-of-CTDI/:serviceId', measurementOfCTDIController.create)
router.get('/measurement-of-CTDI/:testId', measurementOfCTDIController.getById)
router.get('/measurement-of-CTDI/service/:serviceId', measurementOfCTDIController.getByServiceId)
router.put('/measurement-of-CTDI/:testId', measurementOfCTDIController.update)


router.post('/total-filteration/:serviceId', totalFilterationForCTScan.create)
router.get('/total-filteration/:testId', totalFilterationForCTScan.getById)
router.get('/total-filteration/service/:serviceId', totalFilterationForCTScan.getByServiceId)
router.put('/total-filteration/:testId', totalFilterationForCTScan.update)


router.post('/measurement-of-ma-linearity/:serviceId', measurementOfMaLinearityController.create)
router.get('/measurement-of-ma-linearity/:testId', measurementOfMaLinearityController.getById)
router.get('/measurement-of-ma-linearity/service/:serviceId', measurementOfMaLinearityController.getByServiceId)
router.put('/measurement-of-ma-linearity/:testId', measurementOfMaLinearityController.update)


router.post('/output-consistency/:serviceId', outputConsistencyController.create)
router.get('/output-consistency/:testId', outputConsistencyController.getById)
router.get('/output-consistency/service/:serviceId', outputConsistencyController.getByServiceId)
router.put('/output-consistency/:testId', outputConsistencyController.update)

router.post('/radiation-leakage/:serviceId', radiationLeakageLevelFromXRayTubeHouseController.create)
router.get('/radiation-leakage/:testId', radiationLeakageLevelFromXRayTubeHouseController.getById)
router.get('/radiation-leakage/service/:serviceId', radiationLeakageLevelFromXRayTubeHouseController.getByServiceId)
router.put('/radiation-leakage/:testId', radiationLeakageLevelFromXRayTubeHouseController.update)


router.post('/measure-max-radiation-level/:serviceId', measureMaxRadiationLevelControler.create)
router.get('/measure-max-radiation-level/:testId', measureMaxRadiationLevelControler.getById)
router.get('/measure-max-radiation-level/service/:serviceId', measureMaxRadiationLevelControler.getByServiceId)
router.put('/measure-max-radiation-level/:testId', measureMaxRadiationLevelControler.update)

router.post('/low-contrast-resolution/:serviceId', lowContrastResolutionForCTScanController.create)
router.get('/low-contrast-resolution/:testId', lowContrastResolutionForCTScanController.getById)
router.get('/low-contrast-resolution/service/:serviceId', lowContrastResolutionForCTScanController.getByServiceId)
router.put('/low-contrast-resolution/:testId', lowContrastResolutionForCTScanController.update)

router.post('/high-contrast-resolution/:serviceId', highContrastResolutionForCTScanController.create)
router.get('/high-contrast-resolution/:testId', highContrastResolutionForCTScanController.getById)
router.get('/high-contrast-resolution/service/:serviceId', highContrastResolutionForCTScanController.getByServiceId)
router.put('/high-contrast-resolution/:testId', highContrastResolutionForCTScanController.update)

// Report Header
router.get('/report-header/:serviceId', reportDetailController.getReportHeaderForCTScan);

export default router