import express from 'express';
import { competitionsRouter } from './competitions/competitions.router';
import { gameRouter } from './game/game.router';

const router = express.Router();

router.use('/competitions', competitionsRouter);
router.use('/game', gameRouter);

export default router;
