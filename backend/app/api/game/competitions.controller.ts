import { Request, Response } from 'express';
import { Request as JWTRequest } from "express-jwt";
import { lastValueFrom } from "rxjs";

import { FootballApiProvider } from "../../../common/footballApiProvider";
import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";
import { TeamRepositoryImpl } from "../../../db/repositories/team.repo";
import { CompetitionRepository, CompetitionRepositoryImpl } from "../../../db/repositories/competition.repo";
import { MatchRepository, MatchRepositoryImpl } from "../../../db/repositories/match.repo";
import { PredictionRepository, PredictionRepositoryImpl } from "../../../db/repositories/prediction.repo";
import { GameRoundRepository, GameRoundRepositoryImpl } from '../../../db/repositories/gameRound.repo';
import { Prediction } from '../../../db/models';
import { Score } from '../../../common/score';
import { omit } from 'lodash';

export class GameCompetitionsController {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(FootballApiProvider.LIGI, TeamRepositoryImpl.getInstance()),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(FootballApiProvider.LIGI, competitionRepo),
    predictionRepo = PredictionRepositoryImpl.getInstance(matchRepo)
  ) {
    return new GameCompetitionsController(competitionRepo, seasonRepo, gameRoundRepo, matchRepo, predictionRepo);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository
  ) { }

  public getCompetitions = async (req: Request, res: Response) => {
    const competitionList = await lastValueFrom(this.competitionRepo.findAll$())
    const defaultCompetition = competitionList.find(c => c.slug === 'english-premier-league');
    const competitions = competitionList.map(c => omit(c, ['createdAt', 'updatedAt']))
    return res.status(200).json({
      competitions, defaultCompetitionId: defaultCompetition?.id || null
    })
  }

  public getCompetitionSeasons = async (req: Request, res: Response) => {
    const competitionSlug = req.params.competition;
    if (!competitionSlug) {
      throw new Error('competition slug is required');
    }

    const competition = await lastValueFrom(this.competitionRepo.findOne$({ slug: competitionSlug }));
    if (!competition) {
      throw new Error('competition not found')
    }

    const _seasons = await lastValueFrom(this.seasonRepo.findAll$({ 'competition.id': competition.id }));
    const seasons = _seasons.map(s => omit(s, ['competition', 'teams', 'externalReference', 'createdAt', 'updatedAt']))
    return res.status(200).json({
      competitionId: competition.id,
      seasons,
      currentSeasonId: competition.currentSeason || null
    })
  }

  public getCompetitionSeason = async (req: Request, res: Response) => {
    const competitionSlug = req.params.competition;
    const seasonSlug = req.params.season;

    if (!competitionSlug) {
      throw new Error('competition slug is required');
    }
    if (!seasonSlug) {
      throw new Error('season slug is required');
    }

    const season = await lastValueFrom(this.seasonRepo.findOne$({
      'competition.slug': competitionSlug, slug: seasonSlug
    }));

    if (!season) {
      throw new Error('season not found');
    }

    const _teams = await lastValueFrom(this.seasonRepo.getTeamsForSeason$(season.id))
    const teams = _teams.map(t => omit(t, ['aliases', 'createdAt', 'updatedAt']))
    const _rounds = await lastValueFrom(this.gameRoundRepo.findAll$({ season: season.id }))
    const rounds = _rounds.map(r => omit(r, ['createdAt', 'updatedAt']))

    res.status(200).json({
      seasonId: season.id,
      teams,
      rounds,
      currentRound: season.currentGameRound || null
    })
  }

  public getSeasonGameRound = async (req: JWTRequest, res: Response) => {
    const competitionSlug = req.params.competition;
    const seasonSlug = req.params.season;
    const roundSlug = req.params.round;

    try {
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
      const _matches = await lastValueFrom(this.matchRepo.findAll$({
        season: season.id,
        gameRound: round.id
      }))
      const matches = _matches.map(m => omit(m, [
        'allPredictionPointsCalculated', 'allGlobalLeaderboardScoresProcessed', 'createdAt', 'updatedAt'
      ]))
      matches.forEach(m => {
        m.homeTeam = m.homeTeam.id
        m.awayTeam = m.awayTeam.id
      })

      const userId = req.auth?.id;
      if (userId) {
        const _predictions = await lastValueFrom(this.predictionRepo.findOrCreatePredictions$(userId, round.id!))
        const predictions = _predictions.map(p => omit(p, ['createdAt', 'updatedAt']));
        matches.forEach(m => {
          const pred = predictions.find(p => p.match?.toString() === m.id?.toString());
          if (pred) {
            pred.kickOff = pred.timestamp;
          }
          m.prediction = pred || null;
        });
      }

      res.status(200).json({
        roundId: round.id,
        matches
      })
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  }

  public getGameRoundMatch = async (req: JWTRequest, res: Response) => {
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
      const prediction = omit(_prediction, ['createdAt', 'updatedAt']) as Prediction;
      if (prediction) {
        prediction.kickOff = prediction.timestamp;
      }
      _match.prediction = prediction || null;
    }
    const match: any = omit(_match, ['allPredictionPointsCalculated', 'allGlobalLeaderboardScoresProcessed', 'createdAt', 'updatedAt']);
    match.homeTeam = match.homeTeam.id
    match.awayTeam = match.awayTeam.id
    res.status(200).json(match);
  }

  public pickGameRoundJoker = async (req: JWTRequest, res: Response) => {
    const competitionSlug = req.params.competition;
    const seasonSlug = req.params.season;
    const roundSlug = req.params.round;
    const userId = req.auth?.id;
    const matchId: string = req.body.matchId;

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
      season: season?.id, slug: roundSlug
    }));
    if (!round) {
      throw new Error('round not found');
    }

    const _jokerPredictions = await lastValueFrom(this.predictionRepo.pickJoker$(userId, round.id!, matchId))
    const jokerPredictions = _jokerPredictions.map(p => omit(p, ['createdAt', 'updatedAt']));

    res.status(200).json(jokerPredictions)
  }

  public autoPickPredictions = async (req: JWTRequest, res: Response) => {
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

    const _picks = await lastValueFrom(this.predictionRepo.findOrCreatePicks$(userId, round.id!))
    const picks = _picks.map(p => omit(p, ['createdAt', 'updatedAt']));

    res.status(200).json(picks);
  }

  public pickPredictionScore = async (req: JWTRequest, res: Response) => {
    const competitionSlug = req.params.competition;
    const seasonSlug = req.params.season;
    const roundSlug = req.params.round;
    const matchSlug = req.params.match;
    const userId = req.auth?.id;
    const choice: Score = req.body.choice;

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

    const match = await lastValueFrom(this.matchRepo.findOne$({
      season: season.id,
      slug: matchSlug
    }))
    if (!match) {
      throw Error('match not found')
    }
    const _pick = await lastValueFrom(this.predictionRepo.pickScore$(userId, round.id!, match.id!, choice))
    const pick = omit(_pick, ['createdAt', 'updatedAt']);

    res.status(200).json(pick);
  }
}

const gameCompetitionsController = GameCompetitionsController.getInstance();

export default gameCompetitionsController;
