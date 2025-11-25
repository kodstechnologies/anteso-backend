import { Router } from "express";
const router = Router();
import TotalFilteration from "../../../../controllers/Admin/serviceReport/Mammography/TotalFilterationAndAlluminium.conntroller.js"
import ImagingPhantom from "../../../../controllers/Admin/serviceReport/Mammography/ImagingPhantom.controller.js"
import AccuracyOfOperatingPotentialConroller from "../../../../controllers/Admin/serviceReport/Mammography/AccuracyOfOperatingPotential.conroller.js";
import LinearityOfMasLoadingController from "../../../../controllers/Admin/serviceReport/Mammography/LinearityOfMasLoading.controller.js";
import  ReproducibilityOfIrradiationOutput from "../../../../controllers/Admin/serviceReport/Mammography/ReproducibilityOfRadiationOutput.controller.js"

router.post('/total-filteration/:serviceId', TotalFilteration.create)
router.get('/total-filteration-by-serviceId/:serviceId', TotalFilteration.getByServiceId)
router.put('/total-filteration/:testId', TotalFilteration.update)
router.get('/total-filteration/:testId', TotalFilteration.getById)

router.post('/imaging-phantom/:serviceId', ImagingPhantom.create)
router.get('/imaging-phantom/:serviceId', ImagingPhantom.getByServiceId)
router.put('/imaging-phantom/:testId', ImagingPhantom.update)
router.get('/imaging-phantom/:testId', ImagingPhantom.getById)

router.post('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialConroller.create)
router.get('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialConroller.getById)
router.put('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialConroller.update)
router.get('/accuracy-of-operating-potential-by-serviceId/:serviceId', AccuracyOfOperatingPotentialConroller.getByServiceId)

router.post('/linearity-of-mas-loading/:serviceId', LinearityOfMasLoadingController.create)
router.get('/linearity-of-mas-loading-by-service/:serviceId', LinearityOfMasLoadingController.getByServiceId)
router.put('/linearity-of-mas-loading/:testId', LinearityOfMasLoadingController.update)
router.get('/linearity-of-mas-loading/:testId', LinearityOfMasLoadingController.getById)

router.post('/reproducubility-of-irradiation-output/:serviceId', ReproducibilityOfIrradiationOutput.create)
router.get('/reproducubility-of-irradiation-output-by-service/:serviceId', ReproducibilityOfIrradiationOutput.getByServiceId)
router.put('/reproducubility-of-irradiation-output/:testId', ReproducibilityOfIrradiationOutput.update)
router.get('/reproducubility-of-irradiation-output/:testId', ReproducibilityOfIrradiationOutput.getById)


export default router