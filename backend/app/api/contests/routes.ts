import { Router } from 'express';

import handleRequest from '../handleRequest.js';
import { makeGetCompetitionController } from './contestCompetition/getCompetition.controller.js';
import { makeGetContestsController } from './getContests.controller.js';
import { makeGetCompetitionMatchesController } from './matches/getCompetitionMatches.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetContestsController));
router.get('/:competition', handleRequest(makeGetCompetitionController));
router.get(
  '/:competition/matches',
  handleRequest(makeGetCompetitionMatchesController)
);

export default router;
