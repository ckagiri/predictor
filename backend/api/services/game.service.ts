import { Request, Response } from 'express';
import * as data from '../data';

async function getCompetitions(_req: Request, res: Response) {
  try {
    const competitions = data.getCompetitions();
    const selectedCompetition = competitions[0];
    const seasons = data.getSeasons();
    const selectedSeason = seasons[0];
    const teams = data.getTeams();
    const rounds = data.getRounds();
    const selectedRound = rounds[0];
    const matches = data.getMatches();
    const predictions = data.getPredictions();

    res.status(200).json({
      competitions,
      selectedCompetition,
      competitionSeasons: seasons,
      selectedSeason: {
        record: selectedSeason,
        teams,
        rounds,
        matches,
        predictions,
        selectedRound,
      },
    });
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getCompetition(req: Request, res: Response) {
  try {
    const competitions = data.getCompetitions();
    const competition = competitions.filter((c: any) => {
      return c.slug === req.params.slug;
    })[0];
    res.status(200).json(competition);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getSeasons(_req: Request, res: Response) {
  try {
    const seasons = data.getSeasons();
    res.status(200).json(seasons);
  } catch (error) {
    res.status(500).send(error);
  }
}

async function getSeason(req: Request, res: Response) {
  try {
    const seasons = data.getSeasons();
    const season = seasons.find((s: any) => {
      return (
        s.competitionSlug === req.params.competitionSlug &&
        s.slug === req.params.seasonSlug
      );
    })[0];
    const teams = data.getTeams();
    const rounds = data.getRounds();
    const matches = data.getMatches();
    const predictions = data.getPredictions();

    res.status(200).json({
      season,
      teams,
      rounds,
      matches,
      predictions,
    });
  } catch (error) {
    res.status(500).send(error);
  }
}

export default { getCompetitions, getCompetition, getSeasons, getSeason };
