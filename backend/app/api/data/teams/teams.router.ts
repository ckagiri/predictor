import { Router } from 'express';

import handleRequest from '../../handleRequest.js';
import { makeGetTeamController } from './getTeam.controller.js';
import { makeGetTeamsController } from './getTeams.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetTeamsController));
router.get('/:id', handleRequest(makeGetTeamController));

export default router;
