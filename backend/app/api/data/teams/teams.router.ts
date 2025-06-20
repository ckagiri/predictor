import { Router } from 'express';

import handleRequest from '../../handleRequest.js';
import { makeGetTeamsController } from './getAll/getTeams.controller.js';
import { makeGetTeamController } from './getOne/getTeam.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetTeamsController));
router.get('/:id', handleRequest(makeGetTeamController));

export default router;
