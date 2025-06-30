import { Router } from 'express';

import handleRequest from '../handleRequest.js';
import { makeGetCompetitionController } from './competition/getCompetition.controller.js';
import { makeGetContestsController } from './getContests.controller.js';
import { makeGetRoundMatchesController } from './roundMatches/getRoundMatches.controller.js';

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
  '/:competition/:season/:round/matches',
  handleRequest(makeGetRoundMatchesController)
);
export default router;
