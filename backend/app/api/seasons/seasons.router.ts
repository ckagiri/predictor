import { Router } from 'express';
import seasonsController from './seasons.controller';

const router = Router();

router.get('/', seasonsController.getSeasons);
router.get('/:id', seasonsController.getSeason);

export const seasonsRouter = router;
