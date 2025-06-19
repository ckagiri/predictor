import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../db/repositories/season.repo.js';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../db/repositories/team.repo.js';
import { isMongoId } from '../../utils.js';

export class TeamsController {
  constructor(
    private teamRepo: TeamRepository,
    private seasonRepo: SeasonRepository
  ) {}

  public static getInstance(
    teamRepo = TeamRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(teamRepo.footballApiProvider)
  ) {
    return new TeamsController(teamRepo, seasonRepo);
  }

  public getTeam = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!isMongoId(id)) {
        throw new Error('wrong id format');
      }

      const team = await lastValueFrom(this.teamRepo.findById$(id));
      if (team) {
        return res.status(200).json(team);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getTeams = async (req: Request, res: Response) => {
    try {
      const seasonId = req.query.seasonId as string;
      const season = await lastValueFrom(this.seasonRepo.findById$(seasonId));

      let teams;
      if (seasonId) {
        if (!season) {
          return res.status(404).json({ message: 'Season not found' });
        }
        teams = await lastValueFrom(
          this.teamRepo.findAllByIds$(season.teams as string[])
        );
      } else {
        teams = await lastValueFrom(this.teamRepo.findAll$());
      }
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const teamsController = TeamsController.getInstance();

// const makeGetTeamController => res => {
//   const okResponder = new OkResponder(res);
//   const useCase = GetTeamUseCase.getInstance(okResponder, teamRepo)
//   return GetTeamController.getInstance(validation, useCase);
// }
// handleRequest(makeGetTeamController)

// req,res,next => makeController
// controller = makeController(res);
// requestHandler = new RequestHandler(req, res, next, controller)
// requestHandler.handleRequest()
// this.controller.processRequest(mappedHttpRequest)
// this.getTeamUseCase.execute(model)
export default teamsController;
