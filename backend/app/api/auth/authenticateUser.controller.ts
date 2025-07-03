import { Response } from 'express';

import AppError from '../common/AppError.js';
import Controller from '../common/interfaces/Controller.js';
import HttpRequestModel from '../common/interfaces/HttpRequestModel.js';
import OkResponder from '../common/responders/ok.responder.js';
import { FailureResult } from '../common/result/index.js';
import Validator from '../common/validation/validator.js';
import { userAuthValidator } from './auth.validator.js';
import {
  AuthenticateUserUseCase,
  RequestModel,
} from './useCases/authenticateUserUseCase.js';

class AuthenticateUserController implements Controller {
  constructor(
    private readonly AuthenticateUserUseCase: AuthenticateUserUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    AuthenticateUserUseCase: AuthenticateUserUseCase,
    validation = userAuthValidator
  ) {
    return new AuthenticateUserController(AuthenticateUserUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { password, username } = request.body;
    const requestValidated = await this.validation.validate<RequestModel>({
      password,
      username,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    await this.AuthenticateUserUseCase.execute(requestModel);
  }
}

export const makeAuthenticateUserController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = AuthenticateUserUseCase.getInstance(okResponder);
  return AuthenticateUserController.getInstance(useCase);
};
