import { Router } from 'express';
import teamsController from './teams.controller';

const router = Router();

router.get('/', teamsController.getTeams);
router.get('/:id', teamsController.getTeams);

export const teamsRouter = router;
