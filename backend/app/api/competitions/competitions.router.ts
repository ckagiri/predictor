import { Router } from 'express';
import competitionsController from './competitions.controller';

const router = Router();

router.get('/', competitionsController.getCompetitions);
router.get('/:id', competitionsController.getCompetition);

export const competitionsRouter = router;
