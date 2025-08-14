import { Response } from 'express';

import AppError from '../../common/AppError';
import { BackgroundWorkerImpl } from '../../common/BackgroundWorker';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel';
import OkResponder from '../../common/responders/ok.responder';
import { FailureResult } from '../../common/result';
import Validator from '../../common/validation/validator';
import { updateMatchValidator } from './matches.validator';
import UpdateMatchUseCase, {
  RequestModel,
} from './useCases/updateMatch.useCase';

export default class UpdateMatchController {
  constructor(
    private readonly useCase: UpdateMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: UpdateMatchUseCase,
    validation = updateMatchValidator
  ) {
    return new UpdateMatchController(useCase, validation);
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

  makeUpdateMatchController = (res: Response, req: Request) => {
    const okResponder = new OkResponder(res);
    const useCase = UpdateMatchUseCase.getInstance(okResponder);
    return UpdateMatchController.getInstance(useCase);
  };
}
