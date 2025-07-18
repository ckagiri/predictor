import { Request, Response } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import createHttpError, { HttpError } from 'http-errors';

import AppError from './common/AppError.js';
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
    } catch (error: any) {
      this.handleError(error);
    }
  }

  public handleError(error: any): void {
    if (error.isFailure) {
      const appError = error.unwrap() as AppError;
      const httpError = this.makeHttpError(appError);
      this.errorHandler(httpError, appError, error.reason);
    } else {
      this.errorHandler(error);
    }
  }

  private mapHttpRequest(req: JWTRequest): HttpRequestModel {
    return {
      auth: req.auth, // Optional user object for authenticated requests
      body: req.body,
      headers: req.headers,
      params: req.params,
      query: req.query,
    };
  }

  private errorHandler(
    error: any,
    appError?: AppError,
    failReason?: string
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    console.log('Error ', appError?.toString() ?? error.toString());
    console.log('Error-Cause ', appError?.cause ?? error.cause ?? 'N/A');
    this.res.status(error.status ?? 500);
    this.res.send({
      message: error.message, // TODO: if NODE_ENV === 'production', do not send error message (appError.message is fine though)
      reason: failReason ?? 'Something went wrong',
      validationErrors: appError?.validationErrors,
    });
  }

  private makeHttpError(appError: AppError | HttpError): HttpError {
    if (appError instanceof HttpError) return appError;

    if (appError.code === undefined) {
      return createHttpError(500, appError.message);
    }

    const httpErrorCreatorByCode: Record<string, () => HttpError> = {
      [constants.ERR_UNAUTHORIZED]: () => {
        return createHttpError(401, appError.message, {
          headers: { 'WWW-Authenticate': 'Bearer' },
        });
      },
      [constants.ERR_VALIDATION]: () => createHttpError(400, appError),
      [constants.ERR_VALUE_NOT_FOUND]: () => createHttpError(404, appError),
    };

    const createError = httpErrorCreatorByCode[String(appError.code)];
    if (typeof createError !== 'function') {
      return createHttpError(500, appError);
    }

    return createError();
  }
}
