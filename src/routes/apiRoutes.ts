import { Router } from 'express';
import { apiController } from '../controllers/apiController';

const router = Router();

router.get('/health', apiController.health);
router.post('/auth', apiController.registerAndAuth);
router.post('/auth/register', apiController.registerAndAuth);
router.post('/auth/token', apiController.registerAndAuth);
router.get('/vehicle-scheduling/solve', apiController.solveVehicleScheduling);
router.get('/notifications/priority', apiController.getPriorityNotifications);

export default router;
