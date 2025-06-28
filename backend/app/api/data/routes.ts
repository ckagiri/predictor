import express from 'express';

import competitionsRouter from './competitions/competitions.router.js';
import matchesRoutes from './matches/matches.routes.js';
import roundsRoutes from './rounds/rounds.routes.js';
import seasonsRoutes from './seasons/seasons.routes.js';
import teamsRouter from './teams/teams.router.js';

const router = express.Router();

router.use('/competitions', competitionsRouter);
seasonsRoutes.use(competitionsRouter);
roundsRoutes.use(competitionsRouter);
matchesRoutes.use(competitionsRouter);
router.use('/teams', teamsRouter);

export default router;
