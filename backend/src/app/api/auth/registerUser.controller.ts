import { Response } from 'express';

import AppError from '../common/AppError.js';
import Controller from '../common/interfaces/Controller.js';
import HttpRequestModel from '../common/interfaces/HttpRequestModel.js';
import OkResponder from '../common/responders/ok.responder.js';
import { FailureResult } from '../common/result/index.js';
import Validator from '../common/validation/validator.js';
import { userAuthValidator } from './auth.validator.js';
import {
  RegisterUserUseCase,
  RequestModel,
} from './useCases/registerUserUseCase.js';

class RegisterUserController implements Controller {
  constructor(
    private readonly useCase: RegisterUserUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: RegisterUserUseCase,
    validation = userAuthValidator
  ) {
    return new RegisterUserController(useCase, validation);
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
    await this.useCase.execute(requestModel);
  }
}

export const makeRegisterUserController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = RegisterUserUseCase.getInstance(okResponder);
  return RegisterUserController.getInstance(useCase);
};
