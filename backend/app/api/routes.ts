import express from 'express';
import { competitionsRouter } from './competitions/competitions.router';

const router = express.Router();

router.use('/competitions', competitionsRouter);

export default router;
