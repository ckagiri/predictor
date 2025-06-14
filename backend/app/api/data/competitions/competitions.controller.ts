import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

import { Competition } from '../../../../db/models/index.js';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../../db/repositories/competition.repo.js';
import { isMongoId } from '../../utils.js';

export class CompetitionsController {
  constructor(private competitionRepo: CompetitionRepository) {}

  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance()
  ) {
    return new CompetitionsController(competitionRepo);
  }

  public getCompetition = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      let competition: Competition;

      if (isMongoId(id)) {
        competition = await lastValueFrom(this.competitionRepo.findById$(id));
      } else {
        competition = await lastValueFrom(
          this.competitionRepo.findOne$({ slug: id })
        );
      }

      if (competition) {
        return res.status(200).json(competition);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getCompetitions = async (_req: Request, res: Response) => {
    try {
      const competitions = await lastValueFrom(
        this.competitionRepo.findAll$({}, '-createdAt')
      );
      res.status(200).json(competitions);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const competitionsController = CompetitionsController.getInstance();

export default competitionsController;
