import { Router } from 'express';
import { RequestHandler } from 'express';

import matchesController from '../matches/matches.controller.js';
import roundsController from '../rounds/rounds.controller.js';
import seasonsController from '../seasons/seasons.controller.js';
import teamsController from '../teams/teams.controller.js';
import competitionsController from './competitions.controller.js';

const router = Router();

router.get('/', competitionsController.getCompetitions);
router.get('/:id', (req, res, next) => {
  competitionsController.getCompetition(req, res).catch(next);
});
router.get('/:competition/seasons', (req, res, next) => {
  seasonsController.getSeasons(req, res).catch(next);
});
router.get('/:competition/seasons/:slug', seasonsController.getSeason);
router.get('/:competition/seasons/:season/teams', teamsController.getTeams);
router.get('/:competition/seasons/:season/teams/:slug', (req, res, next) => {
  teamsController.getTeam(req, res).catch(next);
});
router.get('/:competition/seasons/:season/matches/:slug', (req, res, next) => {
  matchesController.getMatch(req, res).catch(next);
});
router.get('/:competition/seasons/:season/rounds', roundsController.getRounds);
router.get('/:competition/seasons/:season/rounds/:slug', (req, res, next) => {
  roundsController.getRound(req, res).catch(next);
});
router.get(
  '/:competition/seasons/:season/rounds/:round/matches',
  matchesController.getMatches
);
router.get(
  '/:competition/seasons/:season/rounds/:round/matches/:slug',
  (req, res, next) => {
    matchesController.getMatch(req, res).catch(next);
  }
);

// TODO: add mongoid routes
export default router;
