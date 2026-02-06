import { Router } from 'express';
import * as emailController from '../controllers/emailController';

const router = Router();

router.post('/schedule', emailController.scheduleEmails);
router.get('/emails', emailController.getEmails);
router.get('/stats', emailController.getStats);
router.patch('/emails/:id/star', emailController.toggleStar);

export default router;
