import { NextFunction, Request, Response } from 'express';

import Controller from './common/interfaces/Controller.js';
import RequestHandler from './RequestHandler';

const handleRequest = (makeController: (res: Response) => Controller) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const controller = makeController(res);
    const requestHandler = new RequestHandler(req, res, controller);
    await requestHandler.handleRequest();
  };
};

export default handleRequest;
