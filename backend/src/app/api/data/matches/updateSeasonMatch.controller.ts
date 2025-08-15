import { Response } from 'express';

import AppError from '../../common/AppError';
import { BackgroundWorkerImpl } from '../../common/BackgroundWorker';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel';
import OkResponder from '../../common/responders/ok.responder';
import { FailureResult } from '../../common/result';
import Validator from '../../common/validation/validator';
import { updateSeasonMatchValidator } from './matches.validator';
import UpdateSeasonMatchUseCase, {
  RequestModel,
} from './useCases/updateSeasonMatch.useCase';

export default class UpdateSeasonMatchController {
  constructor(
    private readonly useCase: UpdateSeasonMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: UpdateSeasonMatchUseCase,
    validation = updateSeasonMatchValidator
  ) {
    return new UpdateSeasonMatchController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, season, slug } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      matchDetails: request.body,
      season,
      slug,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    if (request.node2) {
      const worker = BackgroundWorkerImpl.getInstance(request.node2);
      this.useCase.setBackgroundWorker(worker);
    }
    await this.useCase.execute(requestModel);
  }
}

export const makeUpdateSeasonMatchController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = UpdateSeasonMatchUseCase.getInstance(okResponder);
  return UpdateSeasonMatchController.getInstance(useCase);
};
