import { Router } from 'express';
import customMachineController from '../../../controllers/Admin/customMachine.controller.js';

const router = Router();

router.get('/all', customMachineController.getAll);

export default router;
