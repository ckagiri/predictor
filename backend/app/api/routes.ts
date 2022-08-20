
import express from 'express';

import authRouter from './auth/routes';
import adminRouter from './admin/routes';
import gameRouter from './game/routes';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/game', gameRouter);

export default router;
