import { Router } from 'express';

import authMiddleware from '../auth/auth.middleware.js';
import getCompetition from './competition.controller.js';
import competitionSeasonController from './competitionSeason.controller.js';
import gameDataController from './gameData.controller.js';
import roundMatchController from './roundMatch.controller.js';
import seasonRoundController from './seasonRound.controller.js';

const router = Router();

// Helper to wrap async route handlers and forward errors to Express
function asyncHandler(fn: any) {
  return function (req: any, res: any, next: any) {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get('/', asyncHandler(gameDataController.getDefaultData));
router.get('/:competition', asyncHandler(getCompetition.getCompetition));
router.get('/:competition/:season', competitionSeasonController.getSeason);
router.get(
  '/:competition/:season/:round',
  authMiddleware({ credentialsRequired: false }),
  seasonRoundController.getRound
);
router.get(
  '/:competition/:season/:round/my-score',
  authMiddleware(),
  seasonRoundController.myScore
);
router.post(
  '/:competition/:season/:round/auto-pick',
  authMiddleware(),
  seasonRoundController.autoPickPredictions
);
router.post(
  '/:competition/:season/:round/pick-joker',
  authMiddleware(),
  seasonRoundController.pickJoker
);
router.post(
  '/:competition/:season/:round/pick-scores',
  authMiddleware(),
  seasonRoundController.pickPredictionScores
);
router.get(
  '/:competition/:season/:round/:match',
  authMiddleware({ credentialsRequired: false }),
  roundMatchController.getMatch
);
router.post(
  '/:competition/:season/:round/:match/pick-score',
  authMiddleware(),
  roundMatchController.pickPredictionScore
);
router.post(
  '/:competition/:season/:round/:match/pick-joker',
  authMiddleware(),
  roundMatchController.pickJoker
);

export default router;
