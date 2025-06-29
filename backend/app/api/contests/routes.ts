import { Router } from 'express';

import handleRequest from '../handleRequest.js';
import { makeGetCompetitionController } from './competition/getCompetition.controller.js';
import { makeGetContestsController } from './getContests.controller.js';
import { makeGetCompetitionMatchesController } from './matches/getCompetitionMatches.controller.js';
import { makeGetRoundMatchesController } from './matches/getRoundMatches.controller.js';
import { makeGetSeasonMatchesController } from './matches/getSeasonMatches.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetContestsController));
router.get('/:competition', handleRequest(makeGetCompetitionController));
router.get(
  '/:competition/matches',
  handleRequest(makeGetCompetitionMatchesController)
);
router.get(
  '/:competition/:season/matches',
  handleRequest(makeGetSeasonMatchesController)
);
router.get(
  '/:competition/:season/:round/matches',
  handleRequest(makeGetRoundMatchesController)
);
export default router;
