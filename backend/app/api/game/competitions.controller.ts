import { Request, Response } from 'express';
import { Request as JWTRequest } from "express-jwt";
import { lastValueFrom } from "rxjs";

import { SeasonRepository, SeasonRepositoryImpl } from "../../../db/repositories/season.repo";
import { TeamRepository, TeamRepositoryImpl } from "../../../db/repositories/team.repo";
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
    teamRepo = TeamRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance()
  ) {
    return new GameCompetitionsController(competitionRepo, teamRepo, seasonRepo, gameRoundRepo, matchRepo, predictionRepo);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private teamRepo: TeamRepository,
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

    const _teams = await lastValueFrom(this.teamRepo.findAllByIds$(season.teams));
    const teams = _teams.map(t => omit(t, ['aliases', 'createdAt', 'updatedAt']));
    const _rounds = await lastValueFrom(this.gameRoundRepo.findAll$({ season: season.id }));
    const rounds = _rounds.map(r => omit(r, ['createdAt', 'updatedAt']));

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
      const roundMatches = await lastValueFrom(this.matchRepo.findAll$({
        season: season.id,
        gameRound: round.id
      }))

      const userId = req.auth?.id;
      if (userId) {
        const predictions = await lastValueFrom(this.predictionRepo.findOrCreatePredictions$(userId, roundMatches))
        roundMatches.forEach(m => {
          const _prediction = predictions.find(p => p.match?.toString() === m.id);
          const prediction = omit(_prediction, ['createdAt', 'updatedAt']) as Prediction;
          m.prediction = prediction || null;
        });
      }

      const matches = roundMatches.map(m => omit(m, [
        'allPredictionPointsCalculated', 'allGlobalLeaderboardScoresProcessed', 'externalReference', 'createdAt', 'updatedAt'
      ]))
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
      _match.prediction = prediction || null;
    }
    const match: any = omit(_match, [
      'allPredictionPointsCalculated', 'allGlobalLeaderboardScoresProcessed', 'createdAt', 'updatedAt'
    ]);
    match.homeTeamId = match.homeTeam.id;
    match.awayTeamId = match.awayTeam.id;
    delete match.homeTeam;
    delete match.awayTeam;
    res.status(200).json(match);
  }

  public pickGameRoundJoker = async (req: JWTRequest, res: Response) => {
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

    const roundMatches = await lastValueFrom(this.matchRepo.findAll$({
      season: season.id,
      gameRound: round.id
    }))
    const _picks = await lastValueFrom(this.predictionRepo.findOrCreatePicks$(userId, roundMatches))
    const picks = _picks.map(p => omit(p, ['createdAt', 'updatedAt']));

    res.status(200).json(picks);
  }

  public pickPredictionScore = async (req: JWTRequest, res: Response) => {
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
    const pick = omit(_pick, ['createdAt', 'updatedAt']);

    res.status(200).json(pick);
  }
}

const gameCompetitionsController = GameCompetitionsController.getInstance();

export default gameCompetitionsController;
