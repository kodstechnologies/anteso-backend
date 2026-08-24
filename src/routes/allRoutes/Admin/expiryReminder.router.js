import { Router } from "express";
import expiryReminderController from "../../../controllers/Admin/expiryReminder.controller.js";

const router = Router();
router.get("/", expiryReminderController.getExpiryReminders);

export default router;
