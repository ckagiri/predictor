
import express from 'express';

import authRoutes from './auth/routes';
import dataRoutes from './data/routes';
import gameRoutes from './game/routes';

const router = express.Router();

router.use('/', dataRoutes);
router.use('/auth', authRoutes);
router.use('/game', gameRoutes);

export default router;
