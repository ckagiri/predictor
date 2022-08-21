import { Response } from 'express';
import { Request as JWTRequest } from "express-jwt";
import { lastValueFrom } from "rxjs";

import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";
import { MatchRepository, MatchRepositoryImpl } from "../../../db/repositories/match.repo";
import { PredictionRepository, PredictionRepositoryImpl } from "../../../db/repositories/prediction.repo";
import { GameRoundRepository, GameRoundRepositoryImpl } from '../../../db/repositories/gameRound.repo';
import { Prediction } from '../../../db/models';
import { Score } from '../../../common/score';
import { omit } from 'lodash';

export class RoundMatchController {
  static getInstance(
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new RoundMatchController(seasonRepo, gameRoundRepo, matchRepo, predictionRepo);
  }

  constructor(
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository
  ) { }

  getMatch = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const matchSlug = req.params.match;
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

      const _match = await lastValueFrom(this.matchRepo.findOne$({
        season: season.id,
        slug: matchSlug
      }))
      const userId = req.auth?.id;
      if (userId) {
        const _prediction = await lastValueFrom(this.predictionRepo.findOne$(userId, _match?.id!))
        const prediction = omit(_prediction, ['_id', 'createdAt', 'updatedAt']) as Prediction;
        _match.prediction = prediction || null;
      }
      const match: any = omit(_match, [
        '_id', 'allPredictionPointsCalculated', 'allGlobalLeaderboardScoresProcessed', 'createdAt', 'updatedAt'
      ]);
      match.homeTeamId = match.homeTeam.id;
      match.awayTeamId = match.awayTeam.id;
      delete match.homeTeam;
      delete match.awayTeam;
      res.status(200).json(match);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public pickPredictionScore = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const matchSlug = req.params.match;
      const userId = req.auth?.id;
      const choice: Score = req.body;
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
        season: season.id, slug: roundSlug
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

      const _pick = await lastValueFrom(this.predictionRepo.pickScore$(userId, match, roundMatches, choice))
      const pick = omit(_pick, ['_id', 'createdAt', 'updatedAt']);

      res.status(200).json(pick);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  public pickRoundJoker = async (req: JWTRequest, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      const seasonSlug = req.params.season;
      const roundSlug = req.params.round;
      const matchSlug = req.params.match;
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
      res.status(500).send(error);
    }
  }
}

const roundMatchController = RoundMatchController.getInstance();
export default roundMatchController;
