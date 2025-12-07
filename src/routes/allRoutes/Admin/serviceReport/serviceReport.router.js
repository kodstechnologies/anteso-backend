import { Router } from "express";
import reportDetailController from "../../../../controllers/Admin/serviceReport/reportDetail.controller.js";
import CTScanRouter from "../serviceReport/CTScan.router.js"
import InventionalRadiology from "../serviceReport/InventionalRadiology.router.js"
import Mammography from "../serviceReport/Mammography.router.js"
import CArm from "../serviceReport/CArm.router.js"
import FixedRadioFluro from "../serviceReport/FixedRadioFluro.router.js"
import BMD from "../serviceReport/bmd.router.js"
import DentalConeBeamCT from "../serviceReport/DentalConeBeamCT.router.js"
import OPG from "../serviceReport/OPG.router.js"
import DentalIntra from "../serviceReport/DentalIntra.router.js"
import DentalHandHeld from "../serviceReport/DentalHandHeld.router.js"
import RadiographyFixed from "../serviceReport/RadiographyFixed.router.js"
import RadiographyMobileHT from "../serviceReport/RadiographyMobileHT.router.js"
import RadiographyPortable from "../serviceReport/RadiographyPortable.router.js"
import RadiographyMobile from "../serviceReport/RadiographyMobile.router.js"
const  router = Router();
router.get('/get-details/:serviceId', reportDetailController.getCustomerDetails)
router.get('/get-tools/:serviceId', reportDetailController.getTools)
router.put('/report-header/:serviceId', reportDetailController.saveReportHeader)
// router.get('/report-header/:serviceId', reportDetailController.getReportHeader)

// router.get('/get-tools-for-technician-assigned/:serviceId',reportDetailController.)
router.use('/ct-scan', CTScanRouter)
router.use('/inventional-radiology', InventionalRadiology)
router.use('/mammography',Mammography)
router.use('/c-arm',CArm)
router.use('/fixed-radio-fluro', FixedRadioFluro)
router.use('/bmd', BMD)
router.use('/dental-cone-beam-ct', DentalConeBeamCT)
router.use('/opg', OPG)
router.use('/dental-intra', DentalIntra)
router.use('/dental-hand-held', DentalHandHeld)
router.use('/radiography-fixed', RadiographyFixed)
router.use('/radiography-mobile-ht', RadiographyMobileHT)
router.use('/radiography-portable', RadiographyPortable)
router.use('/radiography-mobile', RadiographyMobile)

export default router;