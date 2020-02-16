import express from 'express';
import { gameRoutes } from './game.routes';

const router = express.Router();

router.use('/game', gameRoutes);

export { router };
