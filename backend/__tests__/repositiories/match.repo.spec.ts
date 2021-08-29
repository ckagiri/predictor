import 'mocha';
import { expect } from 'chai';
import { flatMap } from 'rxjs/operators';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { MatchRepositoryImpl } from '../../db/repositories/match.repo';
import memoryDb from '../memoryDb';
import a, { GameData } from '../a';
import { GameRound, Match, Season, Team } from '../../db/models';
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
  .externalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  })
  .seasonStart('2019-08-09T00:00:00+0200')
  .seasonEnd('2020-05-17T16:00:00+0200');

const matchRepo = MatchRepositoryImpl.getInstance(
  ApiProvider.API_FOOTBALL_DATA,
);

const ligiMatchRepo = MatchRepositoryImpl.getInstance(ApiProvider.LIGI);

describe('MatchRepo', function () {
  let gameData: GameData;

  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  describe('create | update', function () {
    let season: Season;
    let team1: Team;
    let team2: Team;
    let gameRound1: GameRound;
    let team1Vteam2: Partial<Match>;

    const manutd = a.team.name('Manchester United').slug('man-utd');
    const mancity = a.team.name('Manchester City').slug('man-city');

    const afdTeam1VTeam2 = {
      id: 233371,
      season: {
        id: 445,
      },
      utcDate: '2020-04-20T14:00:00Z',
      status: 'FINISHED',
      matchday: 1,
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

    beforeEach(async () => {
      const gameData = await a.game
        .withTeams(manutd, mancity)
        .withCompetitions(epl)
        .withSeasons(epl2020
          .withTeams(manutd, mancity)
          .withGameRounds(
            a.gameRound.name('Gameweek 1').position(1),
            a.gameRound.name('Gameweek 2').position(2))
        )
        .build();

      season = gameData.seasons[0];
      team1 = gameData.teams.find(t => t.slug === manutd.team?.slug)!;
      team2 = gameData.teams.find(t => t.slug === mancity.team?.slug)!;
      gameRound1 = gameData.gameRounds.find(r => r.season!.toString() == season.id && r.position === 1)!

      team1Vteam2 = {
        id: undefined,
        seasonId: season.id,
        date: '2019-09-10T11:30:00Z',
        status: MatchStatus.SCHEDULED,
        gameRound: gameRound1.id,
        homeTeamId: team1.id,
        awayTeamId: team2.id,
        result: undefined,
      };
    });

    afterEach(async () => {
      await memoryDb.dropDb();
    });

    it('should save a match', done => {
      ligiMatchRepo.save$(team1Vteam2).subscribe(match => {
        expect(match.season!.toString()).to.equal(season.id);
        expect(match.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
        done();
      });
    });

    it('should findEach By SeasonAndTeams AndUpdateOrCreate', done => {
      ligiMatchRepo
        .save$(team1Vteam2)
        .pipe(
          flatMap(_ =>
            matchRepo.findBySeasonAndTeamsAndUpsert$(afdTeam1VTeam2),
          ),
        )
        .subscribe(match => {
          expect(match.season!.toString()).to.equal(season.id);
          expect(match.slug).to.equal(`${team1.slug}-v-${team2.slug}`);
          done();
        });
    });

    it('should find finished matches with pending predictions', done => {
      ligiMatchRepo
        .save$(team1Vteam2)
        .pipe(
          flatMap(_ =>
            matchRepo.findBySeasonAndTeamsAndUpsert$(afdTeam1VTeam2),
          ),
        )
        .pipe(
          flatMap(_ =>
            matchRepo.findAllFinishedWithPendingPredictions$(season.id!),
          ),
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
          flatMap(_ =>
            matchRepo.findSelectableMatches$(
              season.id!,
              gameRound1.id!,
            ),
          ),
        )
        .subscribe(ms => {
          expect(ms).to.have.length(1);
          done();
        });
    });
  });

  describe('filter | sort | page', function () {
    const liverpool = a.team.name('Liverpool').slug('liverpool');
    const chelsea = a.team.name('Chelsea').slug('chelsea');
    const manutd = a.team.name('Manchester United').slug('man-utd');
    const arsenal = a.team.name('Arsenal').slug('arsenal');
    const everton = a.team.name('Everton').slug('everton');
    const mancity = a.team.name('Manchester City').slug('man-city');
    const teams = [liverpool, arsenal, chelsea, manutd, mancity, everton];

    const epl2020Gw1 = a.gameRound.name('Gameweek 1').position(1);
    const epl2020Gw2 = a.gameRound.name('Gameweek 2').position(2);

    beforeEach(async () => {
      gameData = await a.game
        .withTeams(...teams)
        .withCompetitions(epl)
        .withSeasons(epl2020
          .withTeams(...teams)
          .withGameRounds(epl2020Gw1, epl2020Gw2)
          .withMatches(
            a.match
              .withHomeTeam(chelsea)
              .withAwayTeam(manutd)
              .date('2020-02-11T11:30:00Z')
              .withGameRound(epl2020Gw1),
            a.match
              .withHomeTeam(liverpool)
              .withAwayTeam(arsenal)
              .date('2020-02-10T11:30:00Z')
              .withGameRound(epl2020Gw1),
            a.match
              .withHomeTeam(everton)
              .withAwayTeam(mancity)
              .date('2020-02-15T11:30:00Z')
              .withGameRound(epl2020Gw2),
            a.match
              .withHomeTeam(chelsea)
              .withAwayTeam(liverpool)
              .date('2020-02-14T11:30:00Z')
              .withGameRound(epl2020Gw2),
          ),
        )
        .build();
      return gameData;
    });

    afterEach(async () => {
      await memoryDb.dropDb();
    });

    it('should filter matches by id', done => {
      const id = gameData.matches[0].id;
      ligiMatchRepo
        .find$({
          filter: JSON.stringify({ id }),
        })
        .subscribe(({ result: matches, count }) => {
          expect(count).to.equal(1);
          expect(matches[0].id).to.equal(id);
          done();
        });
    });

    it('should filter matches by team', done => {
      const chelseaId = gameData.teams.find(t => t.slug === 'chelsea')?.id;
      ligiMatchRepo
        .find$({
          filter: JSON.stringify({ 'homeTeam.id': chelseaId }),
        })
        .subscribe(({ result: matches, count }) => {
          expect(matches[0].homeTeam?.id.toString()).to.equal(chelseaId);
          expect(matches[1].homeTeam?.id.toString()).to.equal(chelseaId);
          expect(count).to.equal(2);
          done();
        });
    });

    it('should filter matches by slug', done => {
      ligiMatchRepo
        .find$({
          filter: JSON.stringify({ 'homeTeam.slug': ['chelsea'] }),
        })
        .subscribe(({ result: matches, count }) => {
          expect(matches).to.have.length(2);
          expect(count).to.equal(2);
          done();
        });
    });

    it('should filter matches by multiple slug', done => {
      ligiMatchRepo
        .find$({
          filter: JSON.stringify({ 'homeTeam.slug': ['chelsea', 'everton'] }),
        })
        .subscribe(({ result: matches, count }) => {
          expect(matches).to.have.length(3);
          expect(count).to.equal(3);
          done();
        });
    });

    it('should filter matches by gameRound', done => {
      const season = gameData.seasons[0];
      const gameRound = gameData.gameRounds.find(r => r.season!.toString() == season.id && r.position === 1)!

      ligiMatchRepo
        .find$({
          filter: JSON.stringify({
            'homeTeam.slug': ['chelsea', 'everton'],
            gameRound: gameRound.id,
          }),
        })
        .subscribe(({ result: matches, count }) => {
          expect(matches).to.have.length(1);
          expect(count).to.equal(1);
          done();
        });
    });

    it('should filter matches by search term', done => {
      ligiMatchRepo
        .find$({
          filter: JSON.stringify({ q: 'man' }),
        })
        .subscribe(({ result: matches, count }) => {
          expect(matches).to.have.length(2);
          expect(count).to.equal(2);
          done();
        });
    });

    it('should sort matches by date', done => {
      ligiMatchRepo
        .find$({
          sort: JSON.stringify(['date', 'ASC']),
        })
        .subscribe(({ result: matches }) => {
          expect(matches[0].homeTeam?.slug).to.equal('liverpool');
          expect(matches[0].awayTeam?.slug).to.equal('arsenal');
          done();
        });
    });

    it('should paginate matches', done => {
      ligiMatchRepo
        .find$({
          sort: JSON.stringify(['date', 'ASC']),
          range: JSON.stringify([0, 2]),
        })
        .subscribe(({ result: matches, count }) => {
          expect(count).to.equal(4);
          expect(matches.length).to.equal(2);
          expect(matches[0].homeTeam?.slug).to.equal('liverpool');
          expect(matches[0].awayTeam?.slug).to.equal('arsenal');
          expect(matches[1].homeTeam?.slug).to.equal('chelsea');
          expect(matches[1].awayTeam?.slug).to.equal('man-utd');
          done();
        });
    });
  });
});
