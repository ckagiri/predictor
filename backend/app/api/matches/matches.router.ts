import { Router } from 'express';
import matchesController from './matches.controller';

const router = Router();

router.get('/', matchesController.getMatches);
router.get('/:id', matchesController.getMatch);

export const matchesRouter = router;
