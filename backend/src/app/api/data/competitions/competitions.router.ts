import { Router } from 'express';

import handleRequest from '../../handleRequest.js';
import { makeGetCompetitionController } from './getCompetition.controller.js';
import { makeGetCompetitionsController } from './getCompetitions.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetCompetitionsController));
router.get('/:slug', handleRequest(makeGetCompetitionController));

export default router;
