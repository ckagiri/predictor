import * as express from 'express';
import { competitionService } from '../services';

const router = express.Router();

router.get('/competitions', (req, res) => {
  competitionService.getCompetitions(req, res);
});

export const competitionRoutes = router;
