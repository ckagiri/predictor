import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import OkResponder from '../../../common/responders/ok.responder.js';
import GetTeamUseCase from './getTeam.useCase.js';

class GetTeamController {
  constructor(private readonly getTeamUseCase: GetTeamUseCase) {}

  public static getInstance(getTeamUseCase: GetTeamUseCase) {
    return new GetTeamController(getTeamUseCase);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { id } = request.params;
    await this.getTeamUseCase.execute(id);
  }
}

export const makeGetTeamController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getTeamUseCase = GetTeamUseCase.getInstance(okResponder);
  return GetTeamController.getInstance(getTeamUseCase);
};
