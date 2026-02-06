import { Router } from 'express';
import { scheduleEmails, getEmails, getStats } from '../controllers/emailController';

const router = Router();

router.post('/schedule', scheduleEmails);
router.get('/emails', getEmails);
router.get('/stats', getStats);

export default router;
