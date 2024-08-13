import { Router } from 'express';
import competitionsController from './competitions.controller';
import seasonsController from '../seasons/seasons.controller';
import teamsController from '../teams/teams.controller';
import roundsController from '../rounds/rounds.controller';
import matchesController from '../matches/matches.controller';

const router = Router();

router.get('/', competitionsController.getCompetitions);
router.get('/:id', competitionsController.getCompetition);
router.get('/:competition/seasons', seasonsController.getSeasons);
router.get('/:competition/seasons/:slug', seasonsController.getSeason);
router.get('/:competition/seasons/:season/teams', teamsController.getTeams);
router.get('/:competition/seasons/:season/teams/:slug', teamsController.getTeam);
router.get('/:competition/seasons/:season/matches', matchesController.getMatches);
router.get('/:competition/seasons/:season/matches/:slug', matchesController.getMatch);
router.get('/:competition/seasons/:season/rounds', roundsController.getRounds);
router.get('/:competition/seasons/:season/rounds/:slug', roundsController.getRound);
router.get('/:competition/seasons/:season/rounds/:round/matches', matchesController.getMatches);
router.get('/:competition/seasons/:season/rounds/:round/matches/:slug', matchesController.getMatch);

// TODO: add mongoid routes
export default router;
