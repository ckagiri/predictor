import express from 'express';
import {
  NextFunction,
  ParamsDictionary,
  Request,
  Response,
} from 'express-serve-static-core';
import { ParsedQs } from 'qs';

import * as authController from './auth.controller.js';

const router = express.Router();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return function (req: Request, res: Response, next: NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/register', asyncHandler(authController.register));
router.post('/login', asyncHandler(authController.login));
// router.get('/me', authMiddleware(), asyncHandler(authController.me))

export default router;
