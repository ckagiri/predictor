import { Request, Response } from 'express';
import { lastValueFrom } from "rxjs";
import { omit } from 'lodash';

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

  getCompetitions = async (_req: Request, res: Response) => {
    try {
      const _competitions = await lastValueFrom(this.competitionRepo.findAll$())
      const defaultCompetition = _competitions.find(c => c.slug === 'english-premier-league');
      const competitions = _competitions.map(c => omit(c, ['_id', 'createdAt', 'updatedAt']))
      return res.status(200).json({
        competitions, defaultCompetitionId: defaultCompetition?.id || null
      })
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

const gameCompetitionsController = GameCompetitionsController.getInstance();
export default gameCompetitionsController;
