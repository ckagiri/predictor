import express from 'express';
import { competitionRoutes } from './competition.routes';

const router = express.Router();

router.use('/', competitionRoutes);

export { router };
