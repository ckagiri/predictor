import { Router } from 'express';

import handleRequest from '../handleRequest.js';
import { makeGetContestsController } from './getContests.controller.js';

const router = Router();

router.get('/', handleRequest(makeGetContestsController));

export default router;
