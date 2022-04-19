import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import {
  CompetitionRepositoryImpl,
  CompetitionRepository,
} from '../../../db/repositories/competition.repo';
import { isMongoId } from '../utils';
import { Competition } from '../../../db/models/competition.model';

export class CompetitionsController {
  public static getInstance() {
    return new CompetitionsController(CompetitionRepositoryImpl.getInstance());
  }

  constructor(private competitionRepo: CompetitionRepository) { }

  public getCompetitions = async (_req: Request, res: Response) => {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      res.header('Content-Range', `Competitions 0-${competitions.length - 1}/${competitions.length}`);
      res.status(200).json(competitions);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getCompetition = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      let competition: Competition | undefined;
      if (isMongoId(id)) {
        competition = await this.competitionRepo.findById$(id).toPromise();
      } else {
        const slug = id;
        competition = await this.competitionRepo.findOne$({ slug }).toPromise();
      }
      res.status(200).json(competition);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const competitionsController = CompetitionsController.getInstance();

export default competitionsController;
