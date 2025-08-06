import 'mocha';
import { expect } from 'chai';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { Match } from '../../db/models';
import { MatchStatus } from '../../db/models/match.model';
import { MatchRepositoryImpl } from '../../db/repositories/match.repo';
import a, { GameData } from '../a';
import memoryDb from '../memoryDb';

const epl = a.competition
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const epl2020 = a.season
  .withCompetition(epl)
  .setName('2019-2020')
  .setSlug('2019-20')
  .setYear(2020)
  .setExternalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  })
  .setSeasonStart('2019-08-09T00:00:00+0200')
  .setSeasonEnd('2020-05-17T16:00:00+0200');

const manutd = a.team
  .setName('Manchester United')
  .setShortName('Man Utd')
  .setTla('MNU')
  .setSlug('man-utd');

const mancity = a.team
  .setName('Manchester City')
  .setShortName('Man City')
  .setTla('MCI')
  .setSlug('man-city');

const gw1 = a.gameRound
  .setName('Gameweek 1')
  .setSlug('gameweek-1')
  .setPosition(1);
const gw2 = a.gameRound
  .setName('Gameweek 2')
  .setSlug('gameweek-2')
  .setPosition(2);

const matchRepo = MatchRepositoryImpl.getInstance(
  ApiProvider.API_FOOTBALL_DATA
);

const ligiMatchRepo = MatchRepositoryImpl.getInstance(ApiProvider.LIGI);

describe('MatchRepo', function () {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  describe('create | update', function () {
    let manuVsmanc: Partial<Match>;

    const afdManuVsManc = {
      awayTeam: {
        id: 65,
        shortName: 'Man City',
      },
      homeTeam: {
        id: 66,
        shortName: 'Man Utd',
      },
      id: 233371,
      matchday: 1,
      odds: {
        awayWin: 3.4,
        draw: 3.25,
        homeWin: 2.3,
      },
      score: {
        fullTime: {
          awayTeam: 2,
          homeTeam: 1,
        },
      },
      season: {
        id: 445,
      },
      status: 'FINISHED',
      utcDate: '2020-04-20T14:00:00Z',
    };

    beforeEach(async () => {
      await a.game
        .withTeams(manutd, mancity)
        .withCompetitions(epl)
        .withSeasons(
          epl2020.withTeams(manutd, mancity).withGameRounds(gw1, gw2)
        )
        .build();

      manuVsmanc = {
        awayTeamId: mancity.id,
        gameRound: gw1.id,
        homeTeamId: manutd.id,
        id: undefined,
        result: undefined,
        season: epl2020.id,
        status: MatchStatus.SCHEDULED,
        utcDate: '2019-09-10T11:30:00Z',
      };
    });

    afterEach(async () => {
      await memoryDb.dropDb();
    });

    it('should save a match', done => {
      ligiMatchRepo.add$(manuVsmanc).subscribe(match => {
        expect(match.season.toString()).to.equal(epl2020.id);
        const expectedMatchSlug = `${manutd.tla}-${mancity.tla}`.toLowerCase();
        expect(match.slug).to.equal(expectedMatchSlug);
        done();
      });
    });

    it('should findEach By SeasonAndTeams AndUpdateOrCreate', done => {
      ligiMatchRepo
        .add$(manuVsmanc)
        .pipe(
          mergeMap(_ => matchRepo.findBySeasonAndTeamsAndUpsert$(afdManuVsManc))
        )
        .subscribe(match => {
          expect(match.season.toString()).to.equal(epl2020.id);
          expect(match.slug).to.equal(
            `${manutd.tla}-${mancity.tla}`.toLowerCase()
          );
          done();
        });
    });
  });

  describe('filter | sort | page', function () {
    let gameData: GameData;

    const liverpool = a.team.setName('Liverpool').setSlug('liverpool');
    const chelsea = a.team.setName('Chelsea').setSlug('chelsea');
    const arsenal = a.team.setName('Arsenal').setSlug('arsenal');
    const everton = a.team.setName('Everton').setSlug('everton');
    const teams = [liverpool, arsenal, chelsea, manutd, mancity, everton];

    beforeEach(async () => {
      gameData = await a.game
        .withTeams(...teams)
        .withCompetitions(epl)
        .withSeasons(
          epl2020
            .withTeams(...teams)
            .withGameRounds(gw1, gw2)
            .withMatches(
              a.match
                .withHomeTeam(chelsea)
                .withAwayTeam(manutd)
                .setDate('2020-02-11T11:30:00Z')
                .withGameRound(gw1),
              a.match
                .withHomeTeam(liverpool)
                .withAwayTeam(arsenal)
                .setDate('2020-02-10T11:30:00Z')
                .withGameRound(gw1),
              a.match
                .withHomeTeam(everton)
                .withAwayTeam(mancity)
                .setDate('2020-02-15T11:30:00Z')
                .withGameRound(gw2),
              a.match
                .withHomeTeam(chelsea)
                .withAwayTeam(liverpool)
                .setDate('2020-02-14T11:30:00Z')
                .withGameRound(gw2),
              a.match
                .withHomeTeam(arsenal)
                .withAwayTeam(manutd)
                .setDate('2020-02-16T11:30:00Z')
                .withGameRound(gw2)
            )
        )
        .build();
    });

    afterEach(async () => {
      await memoryDb.dropDb();
    });

    it('should filter matches by id', done => {
      const id = gameData.matches[0].id;
      ligiMatchRepo
        .find$({
          filter: { id },
        })
        .subscribe(({ count, result: matches }) => {
          expect(count).to.equal(1);
          expect(matches[0].id).to.equal(id);
          done();
        });
    });

    it('should filter matches by home/away team', done => {
      const chelseaId = gameData.teams.find(t => t.slug === 'chelsea')?.id;
      ligiMatchRepo
        .find$({
          filter: { 'homeTeam.id': chelseaId },
        })
        .subscribe(({ count, result: matches }) => {
          expect(matches[0].homeTeam?.id.toString()).to.equal(chelseaId);
          expect(matches[1].homeTeam?.id.toString()).to.equal(chelseaId);
          expect(count).to.equal(2);
          done();
        });
    });

    it('should filter matches by slug', done => {
      ligiMatchRepo
        .find$({
          filter: { 'homeTeam.slug': ['chelsea'] },
        })
        .subscribe(({ count, result: matches }) => {
          expect(matches).to.have.length(2);
          expect(count).to.equal(2);
          done();
        });
    });

    it('should filter matches by multiple slug', done => {
      ligiMatchRepo
        .find$({
          filter: { 'homeTeam.slug': ['chelsea', 'everton'] },
        })
        .subscribe(({ count, result: matches }) => {
          expect(matches).to.have.length(3);
          expect(count).to.equal(3);
          done();
        });
    });

    it('should filter matches by gameRound', done => {
      const season = gameData.seasons[0];
      const gameRound = gameData.gameRounds.find(
        r => r.season!.toString() == season.id && r.position === 1
      )!;

      ligiMatchRepo
        .find$({
          filter: {
            gameRound: gameRound.id,
            'homeTeam.slug': ['chelsea', 'everton'],
          },
        })
        .subscribe(({ count, result: matches }) => {
          expect(matches).to.have.length(1);
          expect(count).to.equal(1);
          done();
        });
    });

    it('should filter matches by search term', done => {
      ligiMatchRepo
        .find$({
          filter: { q: 'man' },
        })
        .subscribe(({ count, result: matches }) => {
          expect(matches).to.have.length(3);
          expect(count).to.equal(3);
          done();
        });
    });

    it('should sort matches by date', done => {
      ligiMatchRepo
        .find$({
          sort: ['utcDate', 'asc'],
        })
        .subscribe(({ result: matches }) => {
          expect(matches[0].homeTeam?.slug).to.equal('liverpool');
          expect(matches[0].awayTeam?.slug).to.equal('arsenal');
          done();
        });
    });

    it('should sort matches by date and filter by team', done => {
      ligiMatchRepo
        .find$({
          filter: {
            $or: [{ 'homeTeam.id': arsenal.id }, { 'awayTeam.id': arsenal.id }],
          },
          sort: ['utcDate', 'asc'],
        })
        .subscribe(({ count, result: matches }) => {
          expect(matches[0].homeTeam?.id.toString()).to.equal(liverpool.id);
          expect(matches[0].awayTeam?.id.toString()).to.equal(arsenal.id);

          expect(matches[1].homeTeam?.id.toString()).to.equal(arsenal.id);
          expect(matches[1].awayTeam?.id.toString()).to.equal(manutd.id);

          expect(count).to.equal(2);
          done();
        });
    });

    it('should paginate matches', done => {
      ligiMatchRepo
        .find$({
          range: [0, 2],
          sort: ['utcDate', 'asc'],
        })
        .subscribe(({ count, result: matches }) => {
          expect(count).to.equal(5);
          expect(matches.length).to.equal(3);
          expect(matches[0].homeTeam?.slug).to.equal('liverpool');
          expect(matches[0].awayTeam?.slug).to.equal('arsenal');
          expect(matches[1].homeTeam?.slug).to.equal('chelsea');
          expect(matches[1].awayTeam?.slug).to.equal('man-utd');
          done();
        });
    });
  });
});
