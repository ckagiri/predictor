import * as express from 'express';
import { gameService } from '../services';

const router = express.Router();

router.get('/competitions', (req, res) => {
  gameService.getCompetitions(req, res);
});

router.get('/competitions/:slug', (req, res) => {
  gameService.getCompetition(req, res);
});

router.get('/competitions/:slug/seasons', (req, res) => {
  gameService.getSeasons(req, res);
});

router.get('/competitions/:competitionSlug/seasons/:seasonSlug', (req, res) => {
  gameService.getSeason(req, res);
});

export const gameRoutes = router;
