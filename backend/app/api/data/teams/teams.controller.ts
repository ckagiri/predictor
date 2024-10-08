import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { isMongoId } from '../../utils';
import {
  TeamRepositoryImpl,
  TeamRepository,
} from '../../../../db/repositories/team.repo';
import { SeasonRepository, SeasonRepositoryImpl } from '../../../../db/repositories/season.repo';

export class TeamsController {
  public static getInstance(
    teamRepo = TeamRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(teamRepo.footballApiProvider)
  ) {
    return new TeamsController(teamRepo, seasonRepo);
  }

  constructor(private teamRepo: TeamRepository, private seasonRepo: SeasonRepository) { }

  public getTeams = async (req: Request, res: Response) => {
    try {
      const seasonId = req.query.seasonId as string;
      const season = await lastValueFrom(this.seasonRepo.findById$(seasonId));

      const teams = seasonId
        ? await lastValueFrom(this.teamRepo.findAllByIds$(season.teams as string[]))
        : await lastValueFrom(this.teamRepo.findAll$());
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).send(error);
    }
  };

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
}

const teamsController = TeamsController.getInstance();

export default teamsController;
