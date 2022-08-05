import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import {
  CompetitionRepositoryImpl,
  CompetitionRepository,
} from '../../../db/repositories/competition.repo';
import { isMongoId } from '../utils';

export class CompetitionsController {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance()
  ) {
    return new CompetitionsController(competitionRepo);
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
      if (!isMongoId(id)) {
        throw new Error('wrong id format');
      }
      const competition = await lastValueFrom(this.competitionRepo.findById$(id));
      if (competition) {
        return res.status(200).json(competition);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const competitionsController = CompetitionsController.getInstance();

export default competitionsController;
