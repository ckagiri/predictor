import express from 'express';

import competitionsRouter from './competitions/competitions.router.js';
import seasonsRoutes from './seasons/seasons.routes.js';
import teamsRouter from './teams/teams.router.js';

const router = express.Router();

router.use('/competitions', competitionsRouter);
seasonsRoutes.use(competitionsRouter);
router.use('/teams', teamsRouter);

export default router;
