import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../../db/repositories/competition.repo.js';

export class GameDataController {
  constructor(private competitionRepo: CompetitionRepository) {}

  static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance()
  ) {
    return new GameDataController(competitionRepo);
  }

  public getDefaultData = async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const competition = await lastValueFrom(
        this.competitionRepo.findOne$({ slug }, '-createdAt')
      );
      res.status(200).json({
        competition,
      });
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const gameDataController = GameDataController.getInstance();
export default gameDataController;
