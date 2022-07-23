import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import {
  CompetitionRepositoryImpl,
  CompetitionRepository,
} from '../../../db/repositories/competition.repo';
import { isMongoId } from '../utils';
import { Competition } from '../../../db/models/competition.model';

export class CompetitionsController {
  public static getInstance(competitionRepo?: CompetitionRepository) {
    return new CompetitionsController(competitionRepo ?? CompetitionRepositoryImpl.getInstance());
  }

  constructor(private competitionRepo: CompetitionRepository) { }

  public getCompetitions = async (_req: Request, res: Response) => {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      res.status(200).json(competitions);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getCompetition = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      let competition: Competition;
      if (isMongoId(id)) {
        competition = await lastValueFrom(this.competitionRepo.findById$(id));
      } else {
        competition = await lastValueFrom(this.competitionRepo.findOne$({ slug: id }));
      }
      res.status(200).json(competition);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const competitionsController = CompetitionsController.getInstance();

export default competitionsController;
