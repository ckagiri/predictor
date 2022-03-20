import { Router } from 'express';
import competitionsController from './competitions.controller';
import seasonsController from '../seasons/seasons.controller';
import teamsController from '../teams/teams.controller';
import gameRoundsController from '../gameRounds/gameRounds.controller';
import matchesController from '../matches/matches.controller';

const router = Router();

router.get('/', competitionsController.getCompetitions);
router.get('/:id', competitionsController.getCompetition);
router.get('/:competition/seasons', seasonsController.getSeasons);
router.get('/:competition/seasons/:id', seasonsController.getSeason);
router.get('/:competition/seasons/:season/teams', teamsController.getTeams);
router.get('/:competition/seasons/:season/teams/:id', teamsController.getTeam);
router.get('/:competition/seasons/:season/matches', matchesController.getMatches);
router.get('/:competition/seasons/:season/matches/:id', matchesController.getMatch);
router.get('/:competition/seasons/:season/gamerounds', gameRoundsController.getGameRounds);
router.get('/:competition/seasons/:season/gamerounds/:id', gameRoundsController.getGameRound);
router.get('/:competition/seasons/:season/gamerounds/:gameround/matches', matchesController.getMatches);
router.get('/:competition/seasons/:season/gamerounds/:gameround/matches/:id', matchesController.getMatch);

export const competitionsRouter = router;
