import { Request, Response } from 'express';
import { omit } from 'lodash';
import { lastValueFrom } from 'rxjs';

import { CompetitionRepository, CompetitionRepositoryImpl } from '../../../db/repositories/competition.repo';
import { SeasonRepository, SeasonRepositoryImpl } from '../../../db/repositories/season.repo';
import { GameRoundRepositoryImpl, GameRoundRepository } from '../../../db/repositories/gameRound.repo';
import { TeamRepository, TeamRepositoryImpl } from '../../../db/repositories/team.repo';

export class CompetitionSeasonsController {
  static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    teamRepo = TeamRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    gameRoundRepo = GameRoundRepositoryImpl.getInstance(),
  ) {
    return new CompetitionSeasonsController(competitionRepo, teamRepo, seasonRepo, gameRoundRepo);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private teamRepo: TeamRepository,
    private seasonRepo: SeasonRepository,
    private gameRoundRepo: GameRoundRepository
  ) { }

  getSeasons = async (req: Request, res: Response) => {
    try {
      const competitionSlug = req.params.competition;
      if (!competitionSlug) {
        throw new Error('competition slug is required');
      }

      const competition = await lastValueFrom(this.competitionRepo.findOne$({ slug: competitionSlug }));
      if (!competition) {
        throw new Error('competition not found')
      }

      const _seasons = await lastValueFrom(this.seasonRepo.findAll$({ 'competition.id': competition.id }));
      const seasons = _seasons.map(s => omit(s, ['_id', 'competition', 'teams', 'externalReference', 'createdAt', 'updatedAt']))
      return res.status(200).json({
        competitionId: competition.id,
        seasons,
        currentSeasonId: competition.currentSeason || null
      })
    } catch (error) {
      res.status(500).send(error);
    }
  }

  getSeason = async (req: Request, res: Response) => {
    try {
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
      const teams = _teams.map(t => omit(t, ['_id', 'aliases', 'createdAt', 'updatedAt']));
      const _rounds = await lastValueFrom(this.gameRoundRepo.findAll$({ season: season.id }));
      const rounds = _rounds.map(r => omit(r, ['_id', 'createdAt', 'updatedAt']));

      res.status(200).json({
        seasonId: season.id,
        teams,
        rounds,
        currentRound: season.currentGameRound || null
      })
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

const competitionSeasonsController = CompetitionSeasonsController.getInstance();
export default competitionSeasonsController;
