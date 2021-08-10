import { Router } from 'express';
import gameRoundsController from './gameRounds.controller';

const router = Router();

router.get('/', gameRoundsController.getGameRounds);
router.get('/:id', gameRoundsController.getGameRound);

export const gameRoundsRouter = router;
