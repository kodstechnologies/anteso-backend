import { Router } from 'express';
import { sendOtp, verifyOtp, logout } from '../../../controllers/users/login.controller.js';
import { verifyUserJWT } from '../../../middlewares/userAuthMiddleware.js';
import { authenticate, refreshAccessToken } from '../../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../../middlewares/authorizeRoles.js'
import machineRoutes from '../../../routes/allRoutes/User/machineRoutes.js'
const router = Router();
router.use('/send-otp', sendOtp)
router.use('/verify-otp', verifyOtp)
router.post('/refresh', refreshAccessToken)
router.use(authenticate, authorizeRoles("Admin", "Customer", ""))
// router.post('/machines', machineRoutes)
router.use('/machines', machineRoutes)
// router.use('/logout')
router.post("/logout", logout);


export default router