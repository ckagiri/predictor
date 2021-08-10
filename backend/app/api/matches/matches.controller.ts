import { Request, Response } from 'express';
import {
  SeasonRepositoryImpl,
  SeasonRepository,
} from '../../../db/repositories/season.repo';
import {
  MatchRepositoryImpl,
  MatchRepository,
} from '../../../db/repositories/match.repo';
import {
  GameRoundRepositoryImpl,
  GameRoundRepository,
} from '../../../db/repositories/gameRound.repo';
import { isMongoId } from '../utils';
import { Match } from '../../../db/models/match.model';
import * as _ from 'lodash';

export class MatchesController {
  public static getInstance() {
    return new MatchesController(
      SeasonRepositoryImpl.getInstance(),
      GameRoundRepositoryImpl.getInstance(),
      MatchRepositoryImpl.getInstance());
  }

  constructor(private seasonRepo: SeasonRepository, private gameRoundRepo: GameRoundRepository, private matchRepo: MatchRepository) {}

  public getMatches = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlugOrPosition = req.params.gameround;

      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }

      const season = await this.seasonRepo.findOne$({
        $and: [{'competition.slug': competitionSlug}, {slug: seasonSlug}]
      }).toPromise();

      const gameRound = await this.gameRoundRepo.findOne$({
        $or: [
          {
            $and: [{ season: season.id }, { slug: roundSlugOrPosition }]
          },
          {
            $and: [{ season: season.id}, { position: parseInt(roundSlugOrPosition, 10) || 0 }]
          }
        ]
      }).toPromise();

      const matches = await this.matchRepo
        .findAll$({ season: season.id, gameRound: gameRound.id })
        .toPromise();
      res.status(200).json(matches);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getMatch = async (req: Request, res: Response) => {
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
