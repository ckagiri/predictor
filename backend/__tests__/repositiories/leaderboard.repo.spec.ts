import { expect } from 'chai';
import { mergeMap } from 'rxjs';
import { BOARD_TYPE, STATUS } from '../../db/models/leaderboard.model';

import { LeaderboardRepositoryImpl } from '../../db/repositories/leaderboard.repo';
import memoryDb from '../memoryDb';
import a from '../a';

const leaderboardRepo = LeaderboardRepositoryImpl.getInstance();

const epl = a.competition
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const gw1 = a.gameRound.setName('Gameweek 1').setSlug('gameweek-1').setPosition(1);

const epl2020 = a.season
  .withCompetition(epl)
  .setName('2019-2020')
  .setSlug('2019-20')
  .setYear(2020)
  .setSeasonStart('2021-08-09T00:00:00+0200')
  .setSeasonEnd('2022-05-17T16:00:00+0200')
  .withGameRounds(gw1)

describe('LeaderboardRepo', function () {
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
    await epl2020.build();
  })

  it('should create seasonBoard if it doesnt exist', done => {
    leaderboardRepo.findSeasonLeaderboardOrCreate$(epl2020.id)
      .subscribe(lb => {
        expect(lb.status).to.equal(STATUS.UPDATING);
        expect(lb.season.toString()).to.equal(epl2020.id);
        expect(lb.boardType).to.equal(BOARD_TYPE.GLOBAL_SEASON);
        done();
      });
  });

  it('should create roundboard if it doesnt exist', done => {
    leaderboardRepo.findRoundLeaderboardOrCreate$(epl2020.id, gw1.id)
      .subscribe(lb => {
        expect(lb.status).to.equal(STATUS.UPDATING);
        expect(lb.season.toString()).to.equal(epl2020.id);
        expect(lb.gameRound?.toString()).to.equal(gw1.id);
        expect(lb.boardType).to.equal(BOARD_TYPE.GLOBAL_ROUND);
        done();
      });
  });

  it('should find by id and update status', done => {
    leaderboardRepo.findSeasonLeaderboardOrCreate$(epl2020.id)
      .pipe(
        mergeMap(lb => {
          return leaderboardRepo.findByIdAndUpdate$(lb.id!, {
            status: STATUS.UPDATED,
          });
        }),
      )
      .subscribe(lb => {
        expect(lb.season.toString()).to.equal(epl2020.id);
        expect(lb.boardType).to.equal(BOARD_TYPE.GLOBAL_SEASON)
        expect(lb.status).to.equal(STATUS.UPDATED);
        done();
      });
  });
});

