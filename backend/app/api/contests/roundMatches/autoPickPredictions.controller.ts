import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result, { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { autoPickPredictionsValidator } from '../controller.validators.js';
import AutoPickPredictionsUseCase, {
  RequestModel,
} from './useCases/autoPickPredictions.useCase.js';

class AutoPickPredictionsController {
  constructor(
    private readonly useCase: AutoPickPredictionsUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: AutoPickPredictionsUseCase,
    validation = autoPickPredictionsValidator
  ) {
    return new AutoPickPredictionsController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const loggedInUserId = request.auth?.id as string | undefined;
    if (!loggedInUserId) {
      throw Result.fail(AppError.unauthorized());
    }

    const { competition, round, season } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      loggedInUserId,
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

export const makeAutoPickPredictionsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = AutoPickPredictionsUseCase.getInstance(okResponder);
  return AutoPickPredictionsController.getInstance(useCase);
};
