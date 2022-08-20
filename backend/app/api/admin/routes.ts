import express from 'express';
import { competitionsRouter } from './competitions/competitions.router';
import { seasonsRouter } from './seasons/seasons.router';
import { teamsRouter } from './teams/teams.router';
import { matchesRouter } from './matches/matches.router';
import { gameRoundsRouter } from './gameRounds/gameRounds.router';

const router = express.Router();

router.use('/competitions', competitionsRouter);
router.use('/seasons', seasonsRouter);
router.use('/gamerounds', gameRoundsRouter);
router.use('/teams', teamsRouter);
router.use('/matches', matchesRouter);

export default router;
