import { Router } from 'express';

import handleRequest from '../../handleRequest';
import { makeGetTeamsController } from './getAll/getTeams.controller';
import { makeGetTeamController } from './getOne/getTeam.controller';

const router = Router();

router.get('/', handleRequest(makeGetTeamsController));
router.get('/:id', handleRequest(makeGetTeamController));

export default router;
