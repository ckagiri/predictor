import express from 'express';

import authRoutes from './auth/routes.js';
import contestsRoutes from './contests/routes.js';
import dataRoutes from './data/routes.js';

const router = express.Router();

router.use('/', dataRoutes);
router.use('/auth', authRoutes);
router.use('/contests', contestsRoutes);

export default router;
