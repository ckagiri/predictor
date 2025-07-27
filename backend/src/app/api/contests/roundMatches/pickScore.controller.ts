import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result, { FailureResult } from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { pickScoreValidator } from '../controller.validators.js';
import PickScoreUseCase, {
  RequestModel,
} from './useCases/pickScore.useCase.js';

class PickScoreController {
  constructor(
    private readonly useCase: PickScoreUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: PickScoreUseCase,
    validation = pickScoreValidator
  ) {
    return new PickScoreController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const loggedInUserId = request.auth?.id as string | undefined;
    if (!loggedInUserId) {
      throw Result.fail(AppError.unauthorized());
    }

    const { competition, round, season } = request.params;
    const predictionSlip = request.body as Record<string, string>;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      loggedInUserId,
      predictionSlip,
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

export const makePickScoreController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = PickScoreUseCase.getInstance(okResponder);
  return PickScoreController.getInstance(useCase);
};
