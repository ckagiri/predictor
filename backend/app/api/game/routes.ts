import { Router } from 'express';
import { authMiddleware } from '../auth/utils';
import gameDataController from './gameData.controller';
import competitionController from './competition.controller';
import competitionSeasonController from './competitionSeason.controller';
import roundMatchController from './roundMatch.controller';
import roundLeaderboardController from './roundLeaderboard.controller';
import seasonRoundController from './seasonRound.controller';

const router = Router();

router.get('/', gameDataController.getDefaultData);
router.get('/:competition', competitionController.getCompetition);
router.get('/:competition/:season', competitionSeasonController.getSeason);
router.get('/:competition/:season/:round',
  authMiddleware({ credentialsRequired: false }), seasonRoundController.getRound);
router.get('/:competition/:season/:round/my-score',
  authMiddleware(), roundLeaderboardController.myScore);
router.post('/:competition/:season/:round/auto-pick',
  authMiddleware(), seasonRoundController.autoPickPredictions);
router.post('/:competition/:season/:round/pick-joker',
  authMiddleware(), seasonRoundController.pickJoker);
router.post('/:competition/:season/:round/pick-scores',
  authMiddleware(), seasonRoundController.pickPredictionScores)
router.get('/:competition/:season/:round/:match',
  authMiddleware({ credentialsRequired: false }), roundMatchController.getMatch);
router.post('/:competition/:season/:round/:match/pick-score',
  authMiddleware(), roundMatchController.pickPredictionScore);
router.post('/:competition/:season/:round/:match/pick-joker',
  authMiddleware(), roundMatchController.pickJoker);

export default router;
