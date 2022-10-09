import { Response } from 'express';
import { Request as JWTRequest } from "express-jwt";
import { omit } from 'lodash';
import { lastValueFrom } from "rxjs";

import { GameRoundRepository, GameRoundRepositoryImpl } from '../../../db/repositories/gameRound.repo';
import { MatchRepository, MatchRepositoryImpl } from '../../../db/repositories/match.repo';
import { PredictionRepository, PredictionRepositoryImpl } from '../../../db/repositories/prediction.repo';
import { SeasonRepository, SeasonRepositoryImpl } from '../../../db/repositories/season.repo';
import { Prediction } from '../../../db/models';
import { Score } from '../../../common/score';

class SeasonRoundController {
  static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new SeasonRoundController(seasonRepo, gameRoundRepo, matchRepo, predictionRepo);
  }

  constructor(
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository
  ) { }

  getRound = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;

      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }

      const season = await lastValueFrom(this.seasonRepo.findOne$({
        'competition.slug': competitionSlug, slug: seasonSlug
      }));
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(this.gameRoundRepo.findOne$({
        season: season.id,
        slug: roundSlug
      }));
      const roundMatches = await lastValueFrom(this.matchRepo.findAll$({
        season: season.id,
        gameRound: round.id
      }))

      const userId = req.auth?.id;
      if (userId) {
        const predictions = await lastValueFrom(this.predictionRepo.findOrCreatePredictions$(userId, roundMatches))
        roundMatches.forEach(m => {
          const _prediction = predictions.find(p => p.match?.toString() === m.id);
          const prediction = omit(_prediction, ['_id', 'createdAt', 'updatedAt']) as Prediction;
          m.prediction = prediction || null;
        });
      }

      const getTime = (date?: string | number | Date): number => date != null ? new Date(date).getTime() : 0;
      const matches = roundMatches.map(m => omit(m, [
        '_id', 'allPredictionPointsCalculated', 'allGlobalLeaderboardScoresProcessed', 'externalReference', 'createdAt', 'updatedAt'
      ])).sort((a, b) => {
        return getTime(b.utcDate) - getTime(a.utcDate);
      });
      matches.forEach(m => {
        m.homeTeamId = m.homeTeam.id;
        m.awayTeamId = m.awayTeam.id;
        delete m.homeTeam;
        delete m.awayTeam;
      })
      res.status(200).json({
        roundId: round.id,
        matches
      })
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }

  autoPickPredictions = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const userId = req.auth?.id;

      if (!userId) {
        throw new Error('user id is required')
      }
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }

      const season = await lastValueFrom(this.seasonRepo.findOne$({
        'competition.slug': competitionSlug, slug: seasonSlug
      }));
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(this.gameRoundRepo.findOne$({
        season: season.id, slug: roundSlug
      }));
      if (!round) {
        throw new Error('round not found');
      }

      const roundMatches = await lastValueFrom(this.matchRepo.findAll$({
        season: season.id,
        gameRound: round.id
      }))
      const _picks = await lastValueFrom(this.predictionRepo.findOrCreatePicks$(userId, roundMatches))
      const picks = _picks.map(p => omit(p, ['_id', 'createdAt', 'updatedAt']));

      res.status(200).json(picks);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public pickPredictionScores = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const userId = req.auth?.id;
      const pickSlip: { [key: string]: string } = req.body;
      if (!userId) {
        throw new Error('user id is required')
      }
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }

      const season = await lastValueFrom(this.seasonRepo.findOne$({
        'competition.slug': competitionSlug, slug: seasonSlug
      }));
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(this.gameRoundRepo.findOne$({
        season: season.id, slug: roundSlug
      }));
      if (!round) {
        throw new Error('round not found');
      }

      const roundMatches = await lastValueFrom(this.matchRepo.findAll$({
        season: season.id,
        gameRound: round.id
      }))

      const picks = await Promise.all(
        Object.entries(pickSlip).map(async ([matchSlug, scoreString]) => {
          const match = roundMatches.find(m => m.slug === matchSlug);
          if (match == undefined) return;
          const score = scoreString.split('-');
          const goalsHomeTeam = Number(score[0]);
          const goalsAwayTeam = Number(score[1]);
          const choice = { goalsHomeTeam, goalsAwayTeam } as Score;
          const _pick = await lastValueFrom(this.predictionRepo.pickScore$(userId, match, roundMatches, choice))
          const pick = omit(_pick, ['_id', 'createdAt', 'updatedAt']);
          return pick;
        }).filter(value => value != undefined)) as Prediction[];
      res.status(200).json(picks);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public pickJoker = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const userId = req.auth?.id;
      const matchSlug = req.body && req.body.slug;

      if (!userId) {
        throw new Error('user id is required')
      }
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }
      if (!seasonSlug) {
        throw new Error('season slug is required');
      }
      if (!roundSlug) {
        throw new Error('round slug is required');
      }
      if (!matchSlug) {
        throw new Error('match slug is required');
      }

      const season = await lastValueFrom(this.seasonRepo.findOne$({
        'competition.slug': competitionSlug, slug: seasonSlug
      }));
      if (!season) {
        throw new Error('season not found');
      }

      const round = await lastValueFrom(this.gameRoundRepo.findOne$({
        season: season?.id, slug: roundSlug
      }));
      if (!round) {
        throw new Error('round not found');
      }

      const roundMatches = await lastValueFrom(this.matchRepo.findAll$({
        season: season.id,
        gameRound: round.id
      }))
      const match = roundMatches.find(m => m.slug === matchSlug);
      if (!match) {
        throw Error('match not found')
      }

      const _jokerPredictions = await lastValueFrom(this.predictionRepo.pickJoker$(userId, match, roundMatches))
      const jokerPredictions = _jokerPredictions.map(p => omit(p, ['createdAt', 'updatedAt']));

      res.status(200).json(jokerPredictions)
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
}

const seasonRoundController = SeasonRoundController.getInstance();
export default seasonRoundController;
