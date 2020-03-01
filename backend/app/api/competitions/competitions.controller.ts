import { Request, Response } from 'express';
import { CompetitionRepositoryImpl } from '../../../db/repositories/competition.repo';
import { isMongoId } from './utils';
import { CompetitionModel } from 'db/models/competition.model';

const competitionRepo = CompetitionRepositoryImpl.getInstance();

async function getCompetitions(_req: Request, res: Response) {
  try {
    const competitions = await competitionRepo.findAll$().toPromise()
    res.status(200).json(competitions)
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getCompetition(req: Request, res: Response) {
  try {
    const id = req.params.id;
    let competition: CompetitionModel;
    if (isMongoId(id)) {
      competition = await competitionRepo.findById$(id).toPromise();
    } else {
      const slug = id;
      competition = await competitionRepo.findOne$({ slug }).toPromise();
    }
    res.status(200).json(competition);
  } catch (error) {
    res.status(500).send(error);
  }
}

export { getCompetitions, getCompetition }; 
