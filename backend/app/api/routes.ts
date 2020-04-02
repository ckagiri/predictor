import express from 'express';
import { competitionsRouter } from './competitions/competitions.router';
import { seasonsRouter } from './seasons/seasons.router';
import { teamsRouter } from './teams/teams.router';
import { gameRouter } from './game/game.router';

const router = express.Router();

router.use('/competitions', competitionsRouter);
router.use('/seasons', seasonsRouter);
router.use('/teams', teamsRouter);
router.use('/game', gameRouter);

export default router;
