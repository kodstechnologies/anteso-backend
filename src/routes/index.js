import { Router } from 'express';
import AdminRoutes from '../routes/allRoutes/Admin/adminRoutes.js'
import UserRoutes from '../routes/allRoutes/User/userRoutes.js'
import { getDbStatus } from '../db/index.js';

const router = Router();

router.get('/health', (req, res) => {
    const dbStatus = getDbStatus();
    res.status(dbStatus.connected ? 200 : 503).json({
        success: dbStatus.connected,
        message: dbStatus.connected ? 'API is healthy' : 'Database is unavailable',
        db: dbStatus,
    });
});

router.use('/admin', AdminRoutes)

router.use('/user', UserRoutes)

//dummy data
//summy push
export default router