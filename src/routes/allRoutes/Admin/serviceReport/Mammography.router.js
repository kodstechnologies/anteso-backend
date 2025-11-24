import { Router } from "express";
const router = Router();
import TotalFilteration from "../../../../controllers/Admin/serviceReport/Mammography/TotalFilterationAndAlluminium.conntroller"
import ImagingPhantom from "../../../../controllers/Admin/serviceReport/Mammography/ImagingPhantom.controller"
import AccuracyOfOperatingPotentialConroller from "../../../../controllers/Admin/serviceReport/Mammography/AccuracyOfOperatingPotential.conroller";
import LinearityOfMasLoadingController from "../../../../controllers/Admin/serviceReport/Mammography/LinearityOfMasLoading.controller";

router.post('/total-filteration/:serviceId', TotalFilteration.create)
router.get('/total-filteration/:serviceId', TotalFilteration.getById)
router.put('/total-filteration/:testId', TotalFilteration.update)

router.post('/imaging-phantom/:serviceId', ImagingPhantom.create)
router.get('/imaging-phantom/:serviceId', ImagingPhantom.getById)
router.put('/imaging-phantom/:testId', ImagingPhantom.update)

router.post('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialConroller.create)
router.get('/accuracy-of-operating-potential/:serviceId', AccuracyOfOperatingPotentialConroller.getById)
router.put('/accuracy-of-operating-potential/:testId', AccuracyOfOperatingPotentialConroller.update)

router.post('/linearity-of-mas-loading/:serviceId', LinearityOfMasLoadingController.create)
router.get('/linearity-of-mas-loading/:serviceId', LinearityOfMasLoadingController.getById)
router.put('/linearity-of-mas-loading/:testId', LinearityOfMasLoadingController.update)



export default router