import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { pickScoreValidator } from '../controller.validators.js';
import PickScoreUseCase, {
  RequestModel,
} from './useCases/pickScore.useCase.js';

class PickScoreController {
  constructor(
    private readonly pickScoreUseCase: PickScoreUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    pickScoreUseCase: PickScoreUseCase,
    validation = pickScoreValidator
  ) {
    return new PickScoreController(pickScoreUseCase, validation);
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
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.pickScoreUseCase.execute(requestModel);
  }
}

export const makePickScoreController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const pickScoreUseCase = PickScoreUseCase.getInstance(okResponder);
  return PickScoreController.getInstance(pickScoreUseCase);
};
