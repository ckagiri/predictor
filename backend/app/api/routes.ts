import express from 'express';

import authRoutes from './auth/routes.js';
import dataRoutes from './data/routes.js';
import gameRoutes from './game/routes.js';

const router = express.Router();

router.use('/', dataRoutes);
router.use('/auth', authRoutes);
router.use('/game', gameRoutes);

export default router;
