import { Router } from 'express';
import { authMiddleware } from '../auth/utils'
import competitionsController from './competitions.controller';

const router = Router();

router.get('/', competitionsController.getCompetitions);
router.get('/:competition', competitionsController.getCompetitionSeasons);
router.get('/:competition/:season', competitionsController.getCompetitionSeason);
router.get('/:competition/:season/:round', authMiddleware({ credentialsRequired: false }), competitionsController.getSeasonGameRound);
router.get('/:competition/:season/:round/:match', authMiddleware({ credentialsRequired: false }), competitionsController.getGameRoundMatch);
router.post('/:competition/:season/:round/auto-pick', authMiddleware(), competitionsController.autoPickPredictions);
router.post('/:competition/:season/:round/:match/pick-joker', authMiddleware(), competitionsController.pickGameRoundJoker);
router.post('/:competition/:season/:round/:match/pick-score', authMiddleware(), competitionsController.pickPredictionScore);

export const gameCompetitionsRouter = router;
