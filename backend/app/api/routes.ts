import express from 'express';
import authRouter from './auth/auth.router';
import { competitionsRouter } from './competitions/competitions.router';
import { seasonsRouter } from './seasons/seasons.router';
import { teamsRouter } from './teams/teams.router';
import { matchesRouter } from './matches/matches.router';
import { gameRoundsRouter } from './gameRounds/gameRounds.router';
import { gameCompetitionsRouter } from './game/competitions.router';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/competitions', competitionsRouter);
router.use('/seasons', seasonsRouter);
router.use('/gamerounds', gameRoundsRouter);
router.use('/teams', teamsRouter);
router.use('/matches', matchesRouter);
router.use('/game/competitions', gameCompetitionsRouter);

export default router;
