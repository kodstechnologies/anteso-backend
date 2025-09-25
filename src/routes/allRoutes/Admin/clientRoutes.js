import { Router } from "express";
const router = Router();
import ClientController from '../../../controllers/Admin/client.controller.js'
router.post('/create', ClientController.create)
router.get('/get-all', ClientController.getAll)
router.delete('/delete-by-id/:id', ClientController.deleteById)
router.patch('/update/:id', ClientController.updateById)
router.get('/get-by-id/:id', ClientController.getById)
router.delete('/delete-all', ClientController.deleteAll)



export default router