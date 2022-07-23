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
import { Season } from '../../../db/models/season.model';
import { lastValueFrom } from 'rxjs';

export class MatchesController {
  public static getInstance(
    matchRepo?: MatchRepository,
    gameRoundRepo?: GameRoundRepository,
    seasonRepo?: SeasonRepository,
  ) {
    return new MatchesController(
      matchRepo ?? MatchRepositoryImpl.getInstance(),
      gameRoundRepo ?? GameRoundRepositoryImpl.getInstance(),
      seasonRepo ?? SeasonRepositoryImpl.getInstance(),
    );
  }

  constructor(
    private matchRepo: MatchRepository,
    private gameRoundRepo: GameRoundRepository,
    private seasonRepo: SeasonRepository,
  ) { }

  public getMatches = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlugOrPosition = req.params.gameround;

      //todo: handle filters
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }

      const season: Season = await lastValueFrom(
        this.seasonRepo.findOne$({
          $and: [{ 'competition.slug': competitionSlug }, { slug: seasonSlug }]
        })
      );

      // Todo: check if number
      const gameRound = await lastValueFrom(this.gameRoundRepo.findOne$({
        $or: [
          {
            $and: [{ season: season?.id }, { slug: roundSlugOrPosition }],
          },
          {
            $and: [{ season: season?.id }, { position: parseInt(roundSlugOrPosition, 10) || 0 }],
          },
        ],
      }));

      const matches = await lastValueFrom(this.matchRepo.findAll$({
        season: season?.id, gameRound: gameRound?.id
      }));
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
        match = await lastValueFrom(this.matchRepo.findById$(id));
      } else {
        match = await lastValueFrom(this.matchRepo.findOne$({ slug: id }));
      }
      res.status(200).json(match);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const matchesController = MatchesController.getInstance();

export default matchesController;
