import { Request, Response } from 'express';
import {
  SeasonRepositoryImpl,
  SeasonRepository,
} from '../../../db/repositories/season.repo';
import { isMongoId } from '../utils';
import { Season } from '../../../db/models/season.model';

export class SeasonsController {
  public static getInstance() {
    return new SeasonsController(SeasonRepositoryImpl.getInstance());
  }

  constructor(private seasonRepo: SeasonRepository) { }

  public getSeasons = async (req: Request, res: Response) => {
    try {
      const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
      const competition = req.query.competition || filter.competition;
      let seasons: Season[] = [];
      if (!competition) {
        throw new Error('competition id or slug is required');
      }
      if (isMongoId(competition)) {
        seasons = await this.seasonRepo
          .findAll$({ 'competition.id': competition })
          .toPromise();
      } else {
        seasons = await this.seasonRepo
          .findAll$({ 'competition.slug': competition })
          .toPromise();
      }
      const count = seasons.length;
      res.header('Content-Range', `Seasons 0-${count - 1}/${count}`);
      return res.status(200).json(seasons);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  public getSeason = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      let season: Season;
      if (isMongoId(id)) {
        season = await this.seasonRepo.findById$(id).toPromise();
      } else {
        const slug = id;
        season = await this.seasonRepo.findOne$({ slug }).toPromise();
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
