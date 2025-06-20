import { Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';

import * as constants from './common/constants.js';
import HttpRequestModel from './common/interfaces/HttpRequestModel.js';

export default class RequestHandler {
  private req: Request;
  private res: Response;
  private controller: any;

  public constructor(req: Request, res: Response, controller: any) {
    this.controller = controller;
    this.req = req;
    this.res = res;
  }

  public async handleRequest(): Promise<void> {
    try {
      await this.controller.processRequest(this.mapHttpRequest(this.req));
    } catch (err: any) {
      this.handleError(err);
    }
  }

  public handleError(err: any): void {
    if (err.isFailure) {
      const httpError = this.makeHttpError(err.unwrap());
      this.errorHandler(httpError, err.message);
    } else {
      this.errorHandler(err);
    }
  }

  private mapHttpRequest(req: Request): HttpRequestModel {
    return {
      body: req.body,
      headers: req.headers,
      params: req.params,
      query: req.query,
    };
  }

  private errorHandler(err: any, reason?: string): void {
    this.res.status(err.status ?? 500);
    this.res.send({
      msg: err.msg ?? err.message,
      reason: reason ?? err.reason ?? 'Something went wrong',
      validationErrors: err.validationErrors,
    });
  }

  private makeHttpError(unknownError: any): HttpError {
    if (unknownError.statusCode) return unknownError;

    if (unknownError.code === null || unknownError.code === undefined) {
      return createHttpError(500, unknownError.message);
    }

    const httpErrorCreatorByCode: Record<string, () => HttpError> = {
      [constants.ERR_VALIDATION]: () => createHttpError(400, unknownError),
      [constants.ERR_VALUE_NOT_FOUND]: () => createHttpError(404, unknownError),
    };

    const createError = httpErrorCreatorByCode[String(unknownError.code)];
    if (typeof createError !== 'function') return unknownError;

    return createError();
  }
}
