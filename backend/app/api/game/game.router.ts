import { Router } from 'express';
import gameController from './game.controller';

const router = Router();

router.get('/', gameController.getGameData);

export const gameRouter = router;
