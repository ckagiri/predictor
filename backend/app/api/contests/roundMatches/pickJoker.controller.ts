import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result, { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { pickJokerValidator } from '../controller.validators.js';
import PickJokerUseCase, {
  RequestModel,
} from './useCases/pickJoker.useCase.js';

class PickJokerController {
  constructor(
    private readonly useCase: PickJokerUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: PickJokerUseCase,
    validation = pickJokerValidator
  ) {
    return new PickJokerController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const loggedInUserId = request.auth?.id as string | undefined;
    if (!loggedInUserId) {
      throw Result.fail(AppError.unauthorized());
    }

    const { competition, round, season } = request.params;
    const match = request.body as string | undefined;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      loggedInUserId,
      match,
      round,
      season,
    });
    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    await this.useCase.execute(requestModel);
  }
}

export const makePickJokerController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = PickJokerUseCase.getInstance(okResponder);
  return PickJokerController.getInstance(useCase);
};
