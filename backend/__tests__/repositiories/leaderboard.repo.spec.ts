import { flatMap } from 'rxjs/operators';
import { expect } from 'chai';
import db from '../../db';
import { Competition } from '../../db/models/competition.model';
import { Season, Leaderboard } from '../../db/models';
import { LeaderboardRepositoryImpl } from '../../db/repositories/leaderboard.repo';
import { BOARD_STATUS, BOARD_TYPE } from '../../db/models/leaderboard.model';

const epl: Competition = {
  name: 'English Premier League',
  slug: 'english_premier_league',
  code: 'epl',
};

const epl18: Season = {
  name: '2018-2019',
  slug: '2018-19',
  year: 2018,
  seasonStart: '2018-08-11T00:00:00+0200',
  seasonEnd: '2019-05-13T16:00:00+0200',
  currentMatchRound: 20,
  currentGameRound: '20',
  competition: undefined,
};

const leaderboardRepo = LeaderboardRepositoryImpl.getInstance();
let theSeason: any;

describe('Leaderboard Repo', function () {
  this.timeout(5000);
  before(done => {
    db.init(process.env.MONGO_URI!, done, { drop: true });
  });

  beforeEach(done => {
    db.Competition.create(epl)
      .then(l => {
        const { name, slug, id } = l;
        epl18.competition = { name, slug, id: id! };
        return db.Season.create(epl18);
      })
      .then(s => {
        theSeason = s;
        done();
      });
  });

  afterEach(done => {
    db.drop().then(() => {
      done();
    });
  });

  after(done => {
    db.close().then(() => {
      done();
    });
  });

  describe('findBoardAndUpsert$', () => {
    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const year = now.getFullYear();
    const gameRound = "20";

    it('should create seasonBoard if it doesnt exist', done => {
      leaderboardRepo
        .findSeasonBoardAndUpsert$(theSeason.id, {
          status: BOARD_STATUS.UPDATING_SCORES,
        })
        .subscribe(lb => {
          expect(lb.status).to.equal(BOARD_STATUS.UPDATING_SCORES);
          expect(lb.season.toString()).to.equal(theSeason.id);
          expect(lb.boardType).to.equal(BOARD_TYPE.GLOBAL_SEASON);
          done();
        });
    });

    it('should update seasonBoard if it exists', done => {
      let leaderboard: Leaderboard;
      leaderboardRepo
        .findSeasonBoardAndUpsert$(theSeason.id, {
          status: BOARD_STATUS.UPDATING_SCORES,
        })
        .pipe(
          flatMap(lb => {
            leaderboard = lb;
            return leaderboardRepo.findSeasonBoardAndUpsert$(theSeason.id, {
              status: BOARD_STATUS.UPDATING_RANKINGS,
            });
          }),
        )
        .subscribe(lb => {
          expect(lb.id).to.equal(leaderboard.id);
          expect(lb.status).to.equal(BOARD_STATUS.UPDATING_RANKINGS);
          done();
        });
    });

    it('should create monthBoard if it doesnt exist', done => {
      leaderboardRepo
        .findMonthBoardAndUpsert$(theSeason.id, year, month, {
          status: BOARD_STATUS.UPDATING_SCORES,
        })
        .subscribe(lb => {
          expect(lb.status).to.equal(BOARD_STATUS.UPDATING_SCORES);
          expect(lb.season.toString()).to.equal(theSeason.id);
          expect(lb.boardType).to.equal(BOARD_TYPE.GLOBAL_MONTH);
          expect(lb.year).to.equal(year);
          expect(lb.month).to.equal(month);
          done();
        });
    });

    it('should create roundBoard if it doesnt exist', done => {
      leaderboardRepo
        .findRoundBoardAndUpsert$(theSeason.id, gameRound, {
          status: BOARD_STATUS.UPDATING_SCORES,
        })
        .subscribe(lb => {
          expect(lb.status).to.equal(BOARD_STATUS.UPDATING_SCORES);
          expect(lb.season.toString()).to.equal(theSeason.id);
          expect(lb.boardType).to.equal(BOARD_TYPE.GLOBAL_ROUND);
          expect(lb.gameRound).to.equal(gameRound);
          done();
        });
    });
  });

  // tslint:disable-next-line: only-arrow-functions
  describe('finders', function () {
    let lb1: Leaderboard;
    beforeEach(done => {
      db.Leaderboard.create([
        {
          status: BOARD_STATUS.UPDATING_SCORES,
          boardType: BOARD_TYPE.GLOBAL_SEASON,
          season: theSeason.id,
        },
        {
          status: BOARD_STATUS.UPDATING_SCORES,
          boardType: BOARD_TYPE.GLOBAL_MONTH,
          season: theSeason.id,
          year: 2018,
          month: 4,
        },
        {
          status: BOARD_STATUS.REFRESHED,
          boardType: BOARD_TYPE.GLOBAL_ROUND,
          season: theSeason.id,
          gameRound: 20,
        },
      ]).then(lbs => {
        lb1 = lbs[0];
        done();
      });
    });

    afterEach(done => {
      db.Leaderboard.deleteMany({}).then(() => done());
    });

    it('should find all by season and status', done => {
      leaderboardRepo
        .findAll$({
          season: theSeason.id,
          status: BOARD_STATUS.UPDATING_SCORES,
        })
        .subscribe(lbs => {
          expect(lbs).to.have.length(2);
          done();
        });
    });

    it('should find by id and update status', done => {
      leaderboardRepo
        .findByIdAndUpdate$(lb1.id!, { status: BOARD_STATUS.UPDATING_RANKINGS })
        .subscribe(lb => {
          expect(lb).to.have.property('status', BOARD_STATUS.UPDATING_RANKINGS);
          done();
        });
    });
  });
});
