import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { isMongoId } from '../../utils';
import {
  SeasonRepositoryImpl,
  SeasonRepository,
} from '../../../../db/repositories/season.repo';

export class SeasonsController {
  public static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance()
  ) {
    return new SeasonsController(seasonRepo);
  }

  constructor(private seasonRepo: SeasonRepository) { }

  public getSeasons = async (req: Request, res: Response) => {
    try {
      const competition = req.params.competition;
      if (!competition) {
        throw new Error('competition slug is required');
      }
      const seasons = await lastValueFrom(this.seasonRepo.findAll$({ 'competition.slug': competition }));
      return res.status(200).json(seasons);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  public getSeason = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!isMongoId(id)) {
        throw new Error('wrong id format');
      }
      const season = await lastValueFrom(this.seasonRepo.findById$(id));
      if (season) {
        return res.status(200).json(season);
      } else {
        return res.status(404).send();
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  };
}

const seasonsController = SeasonsController.getInstance();

export default seasonsController;
