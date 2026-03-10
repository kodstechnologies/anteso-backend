import { Router } from "express";
const router = Router();
import upload from "../../../middlewares/upload.js";
import machineController from '../../../controllers/Admin/machine.controller.js'
router.post("/add/:hospitalId", upload.fields([
    { name: "qaReportAttachment", maxCount: 1 },
    { name: "licenseReportAttachment", maxCount: 1 },
    { name: "rawDataAttachment", maxCount: 1 },
]), machineController.add);
router.get('/get-machine-by-hospital/:hospitalId', machineController.getAllMachinesByHospitalId)
router.put('/update/:id', upload.fields([
    { name: "qaReportAttachment", maxCount: 1 },
    { name: "licenseReportAttachment", maxCount: 1 },
    { name: "rawDataAttachment", maxCount: 1 },
]), machineController.updateById)
router.delete('/delete-by-id/:id', machineController.deleteById)
// router.get('/get-all', machineController.getAll)
router.get('/get-by-id/:id/:hospitalId', machineController.getById)
router.get('/search-by-type/:hospitalId', machineController.searchByType)

export default router