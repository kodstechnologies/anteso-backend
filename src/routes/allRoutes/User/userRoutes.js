import { Router } from 'express';
import { sendOtp, verifyOtp, logout } from '../../../controllers/users/login.controller.js';
import { verifyUserJWT } from '../../../middlewares/userAuthMiddleware.js';
import { authenticate, refreshAccessToken } from '../../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../../middlewares/authorizeRoles.js'
import machineRoutes from '../../../routes/allRoutes/User/machineRoutes.js'
const router = Router();
router.post('/send-otp', sendOtp)
router.post('/verify-otp', verifyOtp)
router.post('/refresh', refreshAccessToken)
router.post("/logout", logout);
// router.post('/refresh', (req, res, next) => {
//     console.log("🔥 Hit /refresh route", req.body);
//     next();
// }, refreshAccessToken);

router.use(authenticate, authorizeRoles("Admin", "Customer", ""))
// router.post('/machines', machineRoutes)
router.use('/machines', machineRoutes)
// router.use('/logout')


export default router