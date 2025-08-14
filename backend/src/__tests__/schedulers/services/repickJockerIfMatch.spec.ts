import { expect } from 'chai';
import { addMonths, set } from 'date-fns';
import { lastValueFrom } from 'rxjs';

import { PredictionServiceImpl } from '../../../app/schedulers/prediction.service';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { MatchStatus } from '../../../db/models/match.model';
import {
  MatchRepositoryImpl,
  PredictionRepositoryImpl,
} from '../../../db/repositories';
import a from '../../a';
import memoryDb from '../../memoryDb';

const predictionService = PredictionServiceImpl.getInstance();
const matchRepo = MatchRepositoryImpl.getInstance();
const predictionRepo = PredictionRepositoryImpl.getInstance();

const today = new Date();
// Create initial date: 15th August of current year
const seasonStart = set(today, { date: 15, month: 7 }); // month is 0-indexed
const seasonEnd = addMonths(seasonStart, 10);

const epl = a.competition
  .setName('Premier League')
  .setSlug('premier-league')
  .setCode('PL');

const epl2025 = a.season
  .withCompetition(epl)
  .setName('2025-2026')
  .setSlug('2025-26')
  .setYear(2025)
  .setSeasonStart(seasonStart.toISOString())
  .setSeasonEnd(seasonEnd.toISOString())
  .setExternalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  });

const team1 = a.team.setName('Liverpool').setSlug('liverpool').setTla('LIV');
const team2 = a.team.setName('Arsenal').setSlug('arsenal').setTla('ARS');
const team3 = a.team.setName('Chelsea').setSlug('chelsea').setTla('CHE');
const team4 = a.team.setName('Man Utd').setSlug('man-utd').setTla('MUN');
const team5 = a.team.setName('Man City').setSlug('man-city').setTla('MCI');
const team6 = a.team.setName('Tottenham').setSlug('tottenham').setTla('TOT');
const team7 = a.team.setName('Everton').setSlug('everton').setTla('EVE');
const team8 = a.team.setName('New Castle').setSlug('new-castle').setTla('NEW');

const gw1 = a.gameRound
  .setName('Gameweek 1')
  .setSlug('gameweek-1')
  .setPosition(1);
const gw2 = a.gameRound
  .setName('Gameweek 2')
  .setSlug('gameweek-2')
  .setPosition(2);

const user1 = a.user.setUsername('alice');
const user2 = a.user.setUsername('bob');
const user3 = a.user.setUsername('carol');

const team1Vteam2User1Pred = a.prediction
  .withUser(user1)
  .setHomeScore(2)
  .setAwayScore(0)
  .setJoker(true);

const team1Vteam2User2Pred = a.prediction
  .withUser(user2)
  .setHomeScore(4)
  .setAwayScore(0)
  .setJoker(true);

const team1Vteam2 = a.match
  .withHomeTeam(team1)
  .withAwayTeam(team2)
  .setDate(seasonStart.toISOString())
  .withGameRound(gw1)
  .withPredictions(team1Vteam2User1Pred, team1Vteam2User2Pred)
  .setStatus(MatchStatus.POSTPONED);

const team3Vteam4User3Pred = a.prediction
  .withUser(user3)
  .setHomeScore(2)
  .setAwayScore(1)
  .setJoker(true);

const team3Vteam4 = a.match
  .withHomeTeam(team3)
  .withAwayTeam(team4)
  .setDate(seasonStart.toISOString())
  .withGameRound(gw1)
  .withPredictions(team3Vteam4User3Pred)
  .setStatus(MatchStatus.SCHEDULED);

const team5Vteam6 = a.match
  .withHomeTeam(team5)
  .withAwayTeam(team6)
  .setDate(seasonStart.toISOString())
  .withGameRound(gw1)
  .setStatus(MatchStatus.SCHEDULED);

const team7Vteam8 = a.match
  .withHomeTeam(team7)
  .withAwayTeam(team8)
  .setDate(seasonStart.toISOString())
  .withGameRound(gw1)
  .setStatus(MatchStatus.FINISHED)
  .setHomeScore(4)
  .setAwayScore(1);

describe.only('RepickJokerIfMatch', function () {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  beforeEach(async () => {
    await a.game
      .withUsers(user1, user2, user3)
      .withTeams(team1, team2, team3, team4, team5, team6, team7, team8)
      .withCompetitions(epl)
      .withSeasons(
        epl2025
          .withTeams(team1, team2, team3, team4, team5, team6, team7, team8)
          .withGameRounds(gw1, gw2)
          .withMatches(team1Vteam2, team3Vteam4, team5Vteam6, team7Vteam8)
      )
      .build();
  });

  it('should repickJokerIfMatch', async () => {
    const nbPreds = await predictionService.repickJokerIfMatch(
      team1Vteam2.id,
      gw1.id
    );
    // expect(nbPreds).to.equal(2);
    const jokerPreds = await lastValueFrom(
      predictionRepo.findAll$({
        hasJoker: true,
      })
    );
    console.log('jokerPreds length:', jokerPreds.length);
    const matches = await lastValueFrom(
      matchRepo.findAll$({
        _id: { $in: jokerPreds.map(p => p.match) },
      })
    );
    console.log(
      'matches',
      matches.map(m => m.slug.toString())
    );
  });
});
