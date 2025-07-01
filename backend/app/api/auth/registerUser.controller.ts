import { Response } from 'express';

import AppError from '../common/AppError.js';
import Controller from '../common/interfaces/Controller.js';
import HttpRequestModel from '../common/interfaces/HttpRequestModel.js';
import OkResponder from '../common/responders/ok.responder.js';
import Result from '../common/result/index.js';
import Validator from '../common/validation/validator.js';
import { userAuthValidator } from './auth.validator.js';
import {
  RegisterUserUseCase,
  RequestModel,
} from './useCases/registerUserUseCase.js';

class RegisterUserController implements Controller {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    registerUserUseCase: RegisterUserUseCase,
    validation = userAuthValidator
  ) {
    return new RegisterUserController(registerUserUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { password, username } = request.body;
    const requestValidated = await this.validation.validate<RequestModel>({
      password,
      username,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.registerUserUseCase.execute(requestModel);
  }
}

export const makeRegisterUserController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const registerUserUseCase = RegisterUserUseCase.getInstance(okResponder);
  return RegisterUserController.getInstance(registerUserUseCase);
};
