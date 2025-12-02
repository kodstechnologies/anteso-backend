import { Router } from "express";
const router = Router();
import AccuracyOfOperatingPotentailAndTimeController from "../../../../controllers/Admin/serviceReport/BMD/AccuracyOfOperatingPotentailAndTime.controller.js";
import LinearityOfmALoading from "../../../../controllers/Admin/serviceReport/BMD/LinearityOfMaLoadingStations.controller.js";
import RadiationLeakageLevel from "../../../../controllers/Admin/serviceReport/BMD/RadiationLeakageLevel.controller.js"

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


export default router