import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import {
  SeasonRepositoryImpl,
  SeasonRepository,
} from '../../../db/repositories/season.repo';
import { isMongoId } from '../utils';
import { Season } from '../../../db/models/season.model';

export class SeasonsController {
  public static getInstance(seasonRepo?: SeasonRepository) {
    return new SeasonsController(seasonRepo ?? SeasonRepositoryImpl.getInstance());
  }

  constructor(private seasonRepo: SeasonRepository) { }

  public getSeasons = async (req: Request, res: Response) => {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter as any) : {};
      const competition = req.params.competition || filter.competition;
      if (!competition) {
        throw new Error('competition id or slug is required');
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
      let season: Season | undefined;
      if (isMongoId(id)) {
        season = await lastValueFrom(this.seasonRepo.findById$(id));
      } else {
        season = await lastValueFrom(this.seasonRepo.findOne$({ slug: id }));
      }
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
