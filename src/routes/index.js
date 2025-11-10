import { Router } from 'express';
import AdminRoutes from '../routes/allRoutes/Admin/adminRoutes.js'
import UserRoutes from '../routes/allRoutes/User/userRoutes.js'

const router = Router();

router.use('/admin', AdminRoutes)


router.use('/user', UserRoutes)

//dummy data
export default router