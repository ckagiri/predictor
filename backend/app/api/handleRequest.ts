import { NextFunction, Request, Response } from 'express';

import RequestHandler from './RequestHandler';

const handleRequest = (makeController: (res: Response) => any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const controller = makeController(res);
    const requestHandler = new RequestHandler(req, res, controller);
    await requestHandler.handleRequest();
  };
};

export default handleRequest;
