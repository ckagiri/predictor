import { Router } from 'express';

import handleRequest from '../handleRequest';
import authMiddleware from './auth.middleware';
import { makeAuthenticateUserController } from './authenticateUser.controller.js';
import { makeGetMeController } from './getMe.controller.js';
import { makeRegisterUserController } from './registerUser.controller.js';

const router = Router();

router.post('/register', handleRequest(makeRegisterUserController));
router.post('/login', handleRequest(makeAuthenticateUserController));
router.get('/me', authMiddleware(), handleRequest(makeGetMeController));

export default router;
