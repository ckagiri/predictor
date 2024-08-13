import { Request, Response } from 'express';
import { lastValueFrom } from "rxjs";

import { CompetitionRepository, CompetitionRepositoryImpl } from "../../../db/repositories/competition.repo";

export class GameCompetitionsController {
  static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
  ) {
    return new GameCompetitionsController(competitionRepo);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
  ) { }

  getCompetition = async (req: Request, res: Response) => {
    try {
      const slug = req.params.slug;
      const competition = await lastValueFrom(this.competitionRepo.findOne$({ slug }, '-createdAt'));
      return res.status(200).json({
        competition,
      })
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

const gameCompetitionsController = GameCompetitionsController.getInstance();
export default gameCompetitionsController;
