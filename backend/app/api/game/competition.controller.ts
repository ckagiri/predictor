import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../db/repositories/competition.repo.js';

export class GameCompetitionsController {
  constructor(private competitionRepo: CompetitionRepository) {}

  static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance()
  ) {
    return new GameCompetitionsController(competitionRepo);
  }

  getCompetition = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const competition = await lastValueFrom(
        this.competitionRepo.findOne$({ slug: competitionSlug }, '-createdAt')
      );
      return res.status(200).json({
        competition,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const gameCompetitionsController = GameCompetitionsController.getInstance();
export default gameCompetitionsController;
