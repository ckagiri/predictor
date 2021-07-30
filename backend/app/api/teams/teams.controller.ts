import { Request, Response } from 'express';
import {
  TeamRepositoryImpl,
  TeamRepository,
} from '../../../db/repositories/team.repo';
import { isMongoId } from '../utils';
import { Team } from '../../../db/models/team.model';

export class TeamsController {
  public static getInstance() {
    return new TeamsController(TeamRepositoryImpl.getInstance());
  }

  constructor(private teamRepo: TeamRepository) {}

  public getTeams = async (req: Request, res: Response) => {
    try {
      const seasonId = req.query.seasonId as string;
      const teams: Team[] = seasonId
        ? await this.teamRepo.getAllBySeason$(seasonId).toPromise()
        : await this.teamRepo.findAll$().toPromise();
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
        team = await this.teamRepo.findById$(id).toPromise();
      } else {
        const slug = id;
        team = await this.teamRepo.findOne$({ slug }).toPromise();
      }
      res.status(200).json(team);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const teamsController = TeamsController.getInstance();

export default teamsController;
