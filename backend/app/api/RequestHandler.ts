import { NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { create } from 'lodash';

import * as constants from './common/constants.js';
import HttpRequestModel from './common/interfaces/HttpRequestModel';
import { FailResponse } from './common/responses';

export default class RequestHandler {
  private req: Request;
  private res: Response;
  private next: NextFunction;
  private controller: any;

  public constructor(
    req: Request,
    res: Response,
    next: NextFunction,
    controller: any
  ) {
    this.controller = controller;
    this.req = req;
    this.res = res;
    this.next = next;
  }

  public async handleRequest(): Promise<void> {
    await this.controller.processRequest(this.mapHttpRequest(this.req));
  }

  public handleError(err: any): void {
    if (err.isFailure) {
      const httpError = this.makeHttpError(err.getError());
      this.errorHandler(httpError);
    }
    this.errorHandler(err);
  }

  private mapHttpRequest(req: Request): HttpRequestModel {
    return {
      body: req.body,
      headers: req.headers,
      params: req.params,
      query: req.query,
    };
  }

  private errorHandler(err: any): void {
    this.res.status(err.status ?? 500);
    this.res.send(
      FailResponse.create({
        msg: err.msg ?? err.message,
        reason: err.reason ?? 'Something went wrong',
        validationErrors: err.validationErrors,
      })
    );
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
