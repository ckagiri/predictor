import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import {
  TeamRepositoryImpl,
  TeamRepository,
} from '../../../db/repositories/team.repo';
import { isMongoId } from '../utils';
import { Team } from '../../../db/models/team.model';

export class TeamsController {
  public static getInstance(teamRepo?: TeamRepository) {
    return new TeamsController(teamRepo ?? TeamRepositoryImpl.getInstance());
  }

  constructor(private teamRepo: TeamRepository) { }

  public getTeams = async (req: Request, res: Response) => {
    try {
      const seasonId = req.query.seasonId as string;
      const teams = seasonId
        ? await lastValueFrom(this.teamRepo.getAllBySeason$(seasonId))
        : await lastValueFrom(this.teamRepo.findAll$());
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getTeam = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      let team: Team;
      if (isMongoId(id)) {
        team = await lastValueFrom(this.teamRepo.findById$(id));
      } else {
        team = await lastValueFrom(this.teamRepo.findOne$({ slug: id }));
      }
      res.status(200).json(team);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const teamsController = TeamsController.getInstance();

export default teamsController;
