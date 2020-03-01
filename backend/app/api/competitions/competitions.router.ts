import { Router } from 'express';
import * as competitionsController from './competitions.controller';

const router = Router();

router.get('/', competitionsController.getCompetitions);

export const competitionsRouter = router;

