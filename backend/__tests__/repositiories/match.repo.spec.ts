import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { MatchRepositoryImpl } from '../../db/repositories/match.repo';
import memoryDb from '../memoryDb';
import a, { GameData } from '../a';
import { Match, Season, Team } from '../../db/models';
import { MatchStatus } from '../../db/models/match.model';

const epl = a.competition
  .name('English Premier League')
  .slug('english-premier-league')
  .code('epl');

const epl2020 = a.season
  .withCompetition(epl)
  .name('2019-2020')
  .slug('2019-20')
  .year(2020)
  .currentMatchRound(20)
  .currentGameRound(20)
  .externalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  })
  .seasonStart('2019-08-09T00:00:00+0200')
  .seasonEnd('2020-05-17T16:00:00+0200');

const liverpool = a.team.name('Liverpool').slug('liverpool');
const chelsea = a.team.name('Chelsea').slug('chelsea');
const manutd = a.team.name('Manchester United').slug('man-utd');
const arsenal = a.team.name('Arsenal').slug('arsenal');
const everton = a.team.name('Everton').slug('everton');
const mancity = a.team.name('Manchester City').slug('man-city')


const afdManuVmanc = {
  id: 233371,
  season: {
    id: 445,
  },
  utcDate: '2020-04-20T14:00:00Z',
  status: 'FINISHED',
  matchday: 35,
  score: {
    fullTime: {
      homeTeam: 1,
      awayTeam: 2,
    },
  },
  homeTeam: {
    id: 66,
    name: 'Manchester United',
  },
  awayTeam: {
    id: 65,
    name: 'Manchester City',
  },
  odds: {
    homeWin: 2.3,
    draw: 3.25,
    awayWin: 3.4,
  },
};

const matchRepo = MatchRepositoryImpl.getInstance(
  ApiProvider.API_FOOTBALL_DATA,
);

const ligiMatchRepo = MatchRepositoryImpl.getInstance(ApiProvider.LIGI);

describe('MatchRepo', function () {
  this.timeout(5 * 60 * 1000)
  let gameData: GameData;

  before(async () => {
    await memoryDb.connect();
  });

  afterEach(async () => {
    await memoryDb.dropDb()
  });

  after(async () => {
    await memoryDb.close();
  });

  describe('create update', function () {
    let season: Season;
    let team1: Team;
    let team2: Team;
    let team1Vteam2: Partial<Match>;

    beforeEach(async () => {
      gameData = await a.game
        .withTeams(manutd, mancity)
        .withCompetitions(epl)
        .withSeasons(epl2020.withTeams(manutd, mancity))
        .build();

      season = gameData.seasons[0];
      team1 = gameData.teams.filter(t => t.slug === manutd.getSlug())[0];
      team2 = gameData.teams.filter(t => t.slug === mancity.getSlug())[0];
      team1Vteam2 = {
        id: undefined,
        seasonId: season.id,
        date: '2019-09-10T11:30:00Z',
        status: MatchStatus.SCHEDULED,
        matchRound: 20,
        gameRound: 20,
        homeTeamId: team1.id,
        awayTeamId: team2.id,
        result: undefined,
      };
    });

    it('should save a match', done => {
      ligiMatchRepo
        .save$(team1Vteam2)
        .subscribe(match => {
          expect(match.season!.toString()).to.equal(season.id);
          expect(match.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
          done();
        });
    });

    it('should findEach By SeasonAndTeams AndUpdateOrCreate', done => {
      ligiMatchRepo
        .save$(team1Vteam2)
        .pipe(
          flatMap(_ => matchRepo.findBySeasonAndTeamsAndUpsert$(afdManuVmanc))
        ).subscribe(match => {
          expect(match.season!.toString()).to.equal(season.id);
          expect(match.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
          done();
        });
    });
    
    it('should find finished matches with pending predictions', done => {
      ligiMatchRepo
        .save$(team1Vteam2)
        .pipe(
          flatMap(_ => matchRepo.findBySeasonAndTeamsAndUpsert$(afdManuVmanc))
        )
        .pipe(
          flatMap(_ => matchRepo.findAllFinishedWithPendingPredictions$(season.id!)),
        )
        .subscribe(ms => {
          expect(ms).to.have.length(1);
          done();
        });
    });
    
    it('should find selectable matches for game round', done => {
      ligiMatchRepo
        .save$(team1Vteam2)
        .pipe(
          flatMap(_ => matchRepo.findSelectableMatches$(
            season.id!,
            season.currentGameRound!,
          )),
        )
        .subscribe(ms => {
          expect(ms).to.have.length(1);
          done();
        });
    })    
  })
});
