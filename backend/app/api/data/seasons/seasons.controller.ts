import { Request, Response } from "express";
import { lastValueFrom } from "rxjs";
import {
  SeasonRepositoryImpl,
  SeasonRepository,
} from "../../../../db/repositories/season.repo";
import {
  TeamRepository,
  TeamRepositoryImpl,
} from "../../../../db/repositories/team.repo";

export class SeasonsController {
  static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    teamRepo = TeamRepositoryImpl.getInstance()
  ) {
    return new SeasonsController(seasonRepo, teamRepo);
  }

  constructor(
    private seasonRepo: SeasonRepository,
    private teamRepo: TeamRepository
  ) {}

  public getSeasons = async (req: Request, res: Response) => {
    try {
      const competition = req.params.competition;
      if (!competition) {
        throw new Error("competition slug is required");
      }
      const seasons = await lastValueFrom(
        this.seasonRepo.findAll$(
          { "competition.slug": competition },
          "-createdAt -externalReference -teams"
        )
      );
      return res.status(200).json(seasons);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  getSeason = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.slug;
      if (!competitionSlug) {
        throw new Error("competition slug is required");
      }
      if (!seasonSlug) {
        throw new Error("season slug is required");
      }

      const season = await lastValueFrom(
        this.seasonRepo.findOne$(
          {
            "competition.slug": competitionSlug,
            slug: seasonSlug,
          },
          "-createdAt -externalReference"
        )
      );
      if (!season) {
        throw new Error("season not found");
      }

      // TODO: use populate
      const teams = await lastValueFrom(
        this.teamRepo.findAllByIds$(season.teams as string[])
      );
      season.teams = teams;

      res.status(200).json(season);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

const seasonsController = SeasonsController.getInstance();

export default seasonsController;
