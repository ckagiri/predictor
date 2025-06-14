import express from 'express';

import competitionsRoutes from './competitions/competitions.router.js';

const router = express.Router();

router.use('/competitions', competitionsRoutes);

export default router;
