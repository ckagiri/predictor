import { Router } from 'express';
import { authMiddleware } from '../auth/utils'
import competitionsController from './competitions.controller';

const router = Router();

router.get('/competitions', competitionsController.getCompetitions);
router.get('/competitions/:competition', competitionsController.getCompetitionSeasons);
router.get('/competitions/:competition/:season', competitionsController.getCompetitionSeason);
router.get('/competitions/:competition/:season/:round', authMiddleware({ credentialsRequired: false }), competitionsController.getSeasonGameRound);
router.get('/competitions/:competition/:season/:round/:match', authMiddleware({ credentialsRequired: false }), competitionsController.getGameRoundMatch);
router.post('/competitions/:competition/:season/:round/auto-pick', authMiddleware(), competitionsController.autoPickPredictions);
router.post('/competitions/:competition/:season/:round/:match/pick-joker', authMiddleware(), competitionsController.pickGameRoundJoker);
router.post('/competitions/:competition/:season/:round/:match/pick-score', authMiddleware(), competitionsController.pickPredictionScore);

export default router;
