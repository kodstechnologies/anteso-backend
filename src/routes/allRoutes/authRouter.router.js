import { Router } from "express";
import adminLogin from "../../controllers/Admin/login.controller.js";
import staffLogin from '../../controllers/Admin/login.controller.js'
import { verifyAccessToken } from "../../middlewares/adminAuthMiddleware.js";
import loginController from "../../controllers/Admin/login.controller.js";
import upload from "../../middlewares/upload.js";
const router = Router();
router.post('/send-otp-staff', loginController.sendOtpForStaff)
router.post('/verify-otp-staff', loginController.verifyOtpForStaff)
router.post('/reset-password', loginController.resetPassword)

router.get("/all-states", loginController.getAllStates)

router.post("/add", upload.single("attachment"), loginController.add);


router.post('/login', loginController.adminLogin)
// router.post('/signout',lo)
router.post('/staff-login', loginController.staffLogin)


// router.
export default router