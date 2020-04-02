import { Request, Response } from 'express';
import {
  TeamRepositoryImpl,
  TeamRepository,
} from '../../../db/repositories/team.repo';
import { isMongoId } from '../utils';
import { Team } from '../../../db/models/team.model';

export class TeamsController {
  static getInstance() {
    return new TeamsController(TeamRepositoryImpl.getInstance());
  }

  constructor(private teamRepo: TeamRepository) {}

  getTeams = async (req: Request, res: Response) => {
    try {
      let teams: Team[];
      const seasonId = req.query.seasonId as string;
      if (seasonId) {
        teams = await this.teamRepo.getAllBySeason$(seasonId).toPromise();
      } else {
        teams = await this.teamRepo.findAll$().toPromise();
      }
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  getTeam = async (req: Request, res: Response) => {
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
