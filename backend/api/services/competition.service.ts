import { Request, Response } from 'express';
import * as data from '../data';

async function getCompetitions(_req: Request, res: Response) {
  try {
    const competitions = data.getCompetitions();
    res.status(200).json(competitions);
  } catch (error) {
    res.status(500).send(error);
  }
}

export default { getCompetitions };
