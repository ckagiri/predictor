import { Request, Response } from 'express';
import {
  SeasonRepositoryImpl,
  SeasonRepository,
} from '../../../db/repositories/season.repo';
import { isMongoId } from '../utils';
import { Season } from '../../../db/models/season.model';

export class SeasonsController {
  static getInstance() {
    return new SeasonsController(SeasonRepositoryImpl.getInstance());
  }

  constructor(private seasonRepo: SeasonRepository) {}

  getSeasons = async (req: Request, res: Response) => {
    try {
      const competitionId = req.query.competitionId;
      if (!competitionId) {
        throw new Error('competitionId is required');
      }
      const seasons = await this.seasonRepo
        .findAll$({ 'competition.id': competitionId })
        .toPromise();
      return res.status(200).json(seasons);
    } catch (error) {
      return res.status(500).send(error);
    }
  };

  getSeason = async (req: Request, res: Response) => {
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
