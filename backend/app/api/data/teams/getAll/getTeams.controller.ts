import HttpRequestModel from 'app/api/common/interfaces/HttpRequestModel.js';
import { Response } from 'express';

import OkResponder from '../../../common/responders/ok.responder.js';
import GetTeamsUseCase from './getTeams.useCase.js';

class GetTeamController {
  constructor(private readonly getTeamsUseCase: GetTeamsUseCase) {}

  public static getInstance(getTeamsUseCase: GetTeamsUseCase) {
    return new GetTeamController(getTeamsUseCase);
  }

  async processRequest(_request: HttpRequestModel): Promise<void> {
    await this.getTeamsUseCase.execute();
  }
}

export const makeGetTeamsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getTeamsUseCase = GetTeamsUseCase.getInstance(okResponder);
  return GetTeamController.getInstance(getTeamsUseCase);
};
