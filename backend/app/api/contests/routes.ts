import { Router } from 'express';

import handleRequest from '../handleRequest.js';
import { makeGetCompetitionController } from './competition/getCompetition.controller.js';
import { makeAutoPickPredictionsController } from './roundMatches/autoPickPredictions.controller.js';
import { makeGetContestsController } from './roundMatches/getContests.controller.js';
import { makeGetMatchController } from './roundMatches/getMatch.controller.js';
import { makeGetRoundMatchesController } from './roundMatches/getRoundMatches.controller.js';
import { makePickJokerController } from './roundMatches/pickJoker.controller.js';
import { makePickScoreController } from './roundMatches/pickScore.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetContestsController));

router.get('/:competition', handleRequest(makeGetCompetitionController));
router.get(
  '/:competition/matches',
  handleRequest(makeGetRoundMatchesController)
);
router.get(
  '/:competition/:season/matches',
  handleRequest(makeGetRoundMatchesController)
);
router.get(
  '/:competition/:season/matches/:match',
  handleRequest(makeGetMatchController)
);
router.get(
  '/:competition/:season/:round/matches',
  handleRequest(makeGetRoundMatchesController)
);
router.post(
  '/:competition/:season/:round/auto-pick',
  handleRequest(makeAutoPickPredictionsController)
);
router.post(
  '/:competition/:season/:round/pick-score',
  handleRequest(makePickScoreController)
);
router.post(
  '/:competition/:season/:round/pick-joker',
  handleRequest(makePickJokerController)
);
export default router;
