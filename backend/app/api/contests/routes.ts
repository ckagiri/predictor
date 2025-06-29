import { Router } from 'express';

import handleRequest from '../handleRequest.js';
import { makeGetCompetitionController } from './contestCompetition/getCompetition.controller.js';
import { makeGetContestsController } from './getContests.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetContestsController));
router.get('/:competition', handleRequest(makeGetCompetitionController));

export default router;
