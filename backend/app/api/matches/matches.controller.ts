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
import { Season } from '../../../db/models/season.model';
import { GameRound } from '../../../db/models/gameRound.model';
import { lastValueFrom } from 'rxjs';

export class MatchesController {
  public static getInstance(
    matchRepo = MatchRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
  ) {
    return new MatchesController(matchRepo, seasonRepo, gameRoundRepo);
  }

  constructor(
    private matchRepo: MatchRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
  ) { }

  public getMatches = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonYearOrSlug = req.params.season;
      const roundSlugOrPosition = req.params.gameround;

      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonYearOrSlug) {
        throw new Error('season year or slug is required');
      }

      const isSeasonYear = /^\d{4}$/.test(seasonYearOrSlug);
      let season: Season | undefined;
      if (isSeasonYear) {
        season = await lastValueFrom(this.seasonRepo.findOne$({
          'competition.slug': competitionSlug, year: seasonYearOrSlug
        }));
      } else {
        season = await lastValueFrom(this.seasonRepo.findOne$({
          'competition.slug': competitionSlug, slug: seasonYearOrSlug
        }));
      }

      if (!season) {
        throw new Error('season not found');
      }

      let gameRound: GameRound | undefined;
      const isGameRoundPosition = (param: string) => /^\d{1,2}$/.test(param);
      if (roundSlugOrPosition == undefined) {
        gameRound = undefined;
      } else if (isGameRoundPosition(roundSlugOrPosition)) {
        gameRound = await lastValueFrom(this.gameRoundRepo.findOne$({
          season: season?.id, position: parseInt(roundSlugOrPosition, 10)
        }));
      } else {
        gameRound = await lastValueFrom(this.gameRoundRepo.findOne$({
          season: season?.id, slug: roundSlugOrPosition
        }));
      }

      type FindGameRoundQuery = { season: string, gameRound?: string };
      let query: FindGameRoundQuery = { season: season.id! };
      if (gameRound) {
        query = { ...query, gameRound: gameRound?.id }
      }
      const matches = await lastValueFrom(this.matchRepo.findAll$(query));
      res.status(200).json(matches);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  public getMatch = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!isMongoId(id)) {
        throw new Error('wrong id format');
      }
      const match = await lastValueFrom(this.matchRepo.findById$(id));
      if (match) {
        return res.status(200).json(match);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const matchesController = MatchesController.getInstance();

export default matchesController;
