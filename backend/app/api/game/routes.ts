import { Router } from 'express';
import { authMiddleware } from '../auth/utils'
import competitionsController from './competitions.controller';
import competitionSeasonsController from './competitionSeasons.controller';
import roundMatchController from './roundMatch.controller';
import seasonRoundController from './seasonRound.controller';

const router = Router();

router.get('/competitions', competitionsController.getCompetitions);
router.get('/competitions/:competition', competitionSeasonsController.getSeasons);
router.get('/competitions/:competition/:season', competitionSeasonsController.getSeason);
router.get('/competitions/:competition/:season/:round',
  authMiddleware({ credentialsRequired: false }), seasonRoundController.getRound);
router.post('/competitions/:competition/:season/:round/auto-pick',
  authMiddleware(), seasonRoundController.autoPickPredictions);
router.post('/competitions/:competition/:season/:round/pick-joker',
  authMiddleware(), seasonRoundController.pickJoker);
router.post('/competitions/:competition/:season/:round/pick-scores',
  authMiddleware(), seasonRoundController.pickPredictionScores)
router.get('/competitions/:competition/:season/:round/:match',
  authMiddleware({ credentialsRequired: false }), roundMatchController.getMatch);
router.post('/competitions/:competition/:season/:round/:match/pick-score',
  authMiddleware(), roundMatchController.pickPredictionScore);
router.post('/competitions/:competition/:season/:round/:match/pick-joker',
  authMiddleware(), roundMatchController.pickRoundJoker);


export default router;
