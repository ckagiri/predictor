import express from 'express';

import competitionsRoutes from './competitions/competitions.router.js';
import teamsRoutes from './teams/teams.router.js';

const router = express.Router();

router.use('/competitions', competitionsRoutes);
router.use('/teams', teamsRoutes);

export default router;
