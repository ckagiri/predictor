import { Request, Response } from 'express';
import {
  MatchRepositoryImpl,
  MatchRepository,
} from '../../../db/repositories/match.repo';
import { isMongoId } from '../utils';
import { Match } from '../../../db/models/match.model';

export class MatchesController {
  static getInstance() {
    return new MatchesController(MatchRepositoryImpl.getInstance());
  }

  constructor(private matchRepo: MatchRepository) {}

  getMatches = async (req: Request, res: Response) => {
    try {
      const seasonId = req.query.seasonId;
      if (!seasonId) {
        throw new Error('seasonId is required');
      }
      const matches = await this.matchRepo
        .findAll$({ season: seasonId })
        .toPromise();
      res.status(200).json(matches);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  getMatch = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      let match: Match;
      if (isMongoId(id)) {
        match = await this.matchRepo.findById$(id).toPromise();
      } else {
        const slug = id;
        match = await this.matchRepo.findOne$({ slug }).toPromise();
      }
      res.status(200).json(match);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const matchesController = MatchesController.getInstance();

export default matchesController;
