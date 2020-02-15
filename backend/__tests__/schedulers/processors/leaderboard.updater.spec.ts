import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { LeaderboardUpdater } from '../../../app/schedulers/leaderboard.updater';
import { FixtureStatus, IFixture } from '../../../db/models/fixture.model';
import { PredictionStatus } from '../../../db/models/prediction.model';
import { BOARD_STATUS } from '../../../db/models/leaderboard.model';
import { CacheService } from '../../../common/observableCacheService';

const seasonId = '4edd40c86762e0fb12000001';
const gameRound = 2;
const newFixture = (
  id: any,
  homeTeamName: string,
  awayTeamName: string,
  status: string = FixtureStatus.FINISHED,
) => {
  return {
    id: ObjectId().toHexString(),
    season: seasonId,
    gameRound,
    date: new Date(),
    homeTeam: { id: ObjectId().toHexString(), name: homeTeamName },
    awayTeam: { id: ObjectId().toHexString(), name: awayTeamName },
    status,
    result: { goalsHomeTeam: 2, goalsAwayTeam: 1 },
    allPredictionsProcessed: false,
    externalReference: {
      [ApiProvider.API_FOOTBALL_DATA]: { id },
    },
  } as IFixture;
};
const arsVche = newFixture(1, 'Arsenal', 'Chelsea');
const livVsou = newFixture(2, 'Liverpool', 'Southampton');
const eveVwat = newFixture(3, 'Everton', 'Watford', FixtureStatus.IN_PLAY);
const newPrediction = (userId: string, fixture: IFixture, status = PredictionStatus.PENDING) => {
  return {
    id: ObjectId().toHexString(),
    user: userId,
    fixture,
    status,
    choice: { goalsHomeTeam: 1, goalsAwayTeam: 1 },
    hasJoker: false,
    points: {
      points: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      MatchOutcomePoints: 0,
      GoalDifferencePoints: 0,
      TeamScorePoints: 0,
    },
  };
};
const finishedFixtures = [arsVche, livVsou, eveVwat];
const leaderboardRepoStub: any = {
  findSeasonBoardAndUpsert$: sinon.stub(),
  findMonthBoardAndUpsert$: sinon.stub(),
  findRoundBoardAndUpsert$: sinon.stub(),
  findAll$: sinon.stub(),
  findByIdAndUpdate$: sinon.stub(),
};
const chalo = {
  id: ObjectId().toHexString(),
  userName: 'chalo',
};
const kagiri = {
  id: ObjectId().toHexString(),
  userName: 'kagiri',
};
const pred1 = newPrediction(chalo.id, arsVche);
const lb1 = { id: ObjectId().toHexString() };
const lb2 = { id: ObjectId().toHexString() };
const standing1 = {
  id: ObjectId().toHexString(),
  leaderboard: lb1.id,
  user: kagiri.id,
  points: 20,
  positionOld: 1,
  positionNew: 1,
};
const standing2 = {
  id: ObjectId().toHexString(),
  leaderboard: lb1.id,
  user: chalo.id,
  points: 30,
  positionOld: 2,
  positionNew: 2,
};
const userRepoStub: any = {
  findAll$: () => {
    return of([chalo, kagiri]);
  },
};
const predictionRepoStub: any = {
  findOne$: () => {
    return of(pred1);
  },
};
const userScoreRepoStub: any = {
  findOneAndUpsert$: () => {
    return of({ id: ObjectId().toHexString() });
  },
  findByLeaderboardOrderByPoints$: () => {
    return of([standing2, standing1]);
  },
  findByIdAndUpdate$: () => {
    return of(standing1);
  },
};
const leaderboardUpdater = new LeaderboardUpdater(
  userRepoStub,
  leaderboardRepoStub,
  predictionRepoStub,
  userScoreRepoStub,
);

describe('Leaderboard Updater', () => {
  describe('updateScores', () => {
    beforeEach(() => {
      leaderboardRepoStub.findSeasonBoardAndUpsert$.returns(of({ id: 1 }));
      leaderboardRepoStub.findMonthBoardAndUpsert$.returns(of({ id: 2 }));
      leaderboardRepoStub.findRoundBoardAndUpsert$.returns(of({ id: 3 }));
      leaderboardRepoStub.findAll$.returns(of([lb1]));
      leaderboardRepoStub.findByIdAndUpdate$.returns(of(lb1));
    });
    afterEach(() => {
      leaderboardRepoStub.findSeasonBoardAndUpsert$ = sinon.stub();
      leaderboardRepoStub.findMonthBoardAndUpsert$ = sinon.stub();
      leaderboardRepoStub.findRoundBoardAndUpsert$ = sinon.stub();
    });

    it('should getUsers', async () => {
      const spy = sinon.spy(userRepoStub, 'findAll$');

      await leaderboardUpdater.updateScores(finishedFixtures);

      expect(spy).to.have.been.calledTwice;
    });

    it('should get Seasonboard and set status to UPDATING_SCORES ', async () => {
      const spy = leaderboardRepoStub.findSeasonBoardAndUpsert$;

      await leaderboardUpdater.updateScores(finishedFixtures);

      expect(spy).to.have.been.called;
      expect(spy).to.have.been.calledWith(seasonId, { status: BOARD_STATUS.UPDATING_SCORES });
    });

    it('should get Monthboard and set status to UPDATING_SCORES ', async () => {
      const spy = leaderboardRepoStub.findMonthBoardAndUpsert$;

      await leaderboardUpdater.updateScores(finishedFixtures);

      expect(spy).to.have.been.called;
      const month = arsVche.date.getUTCMonth() + 1;
      const year = arsVche.date.getFullYear();
      expect(spy.firstCall).to.have.been.calledWith(seasonId, year, month, {
        status: BOARD_STATUS.UPDATING_SCORES,
      });
    });

    it('should get Roundboard and set status to UPDATING_SCORES ', async () => {
      const spy = leaderboardRepoStub.findRoundBoardAndUpsert$;

      await leaderboardUpdater.updateScores(finishedFixtures);

      expect(spy).to.have.been.called;
      expect(spy).to.have.been.calledWith(seasonId, gameRound, {
        status: BOARD_STATUS.UPDATING_SCORES,
      });
    });
    it('should get fixture prediction for the user', async () => {
      const spy = sinon.spy(predictionRepoStub, 'findOne$');

      await leaderboardUpdater.updateScores(finishedFixtures);

      expect(spy).to.have.been.called;
      expect(spy).to.have.been.calledWith(sinon.match({ userId: chalo.id, fixtureId: arsVche.id }));
    });
    it('should cache boards', async () => {
      const spy = leaderboardRepoStub.findSeasonBoardAndUpsert$;
      leaderboardUpdater.setCacheService(new CacheService());
      await leaderboardUpdater.updateScores(finishedFixtures);

      expect(spy).to.have.callCount(4);
    });
    it('should save userScores', async () => {
      const spy = sinon.spy(userScoreRepoStub, 'findOneAndUpsert$');

      const count = await leaderboardUpdater.updateScores(finishedFixtures);
      expect(spy).to.have.been.called;
      expect(spy.getCall(0).args.length).to.equal(6);
    });
  });
  describe('UpdateRankings', () => {
    it('should get leaderboards that have UPDATING_SCORES status', async () => {
      const spy = leaderboardRepoStub.findAll$;

      await leaderboardUpdater.updateRankings(seasonId);

      expect(spy).to.have.been.called;
    });

    it('should change leaderboard status to UPDATING_RANKINGS', async () => {
      const spy = leaderboardRepoStub.findByIdAndUpdate$;

      await leaderboardUpdater.updateRankings(seasonId);

      expect(spy).to.have.been.called;
      expect(spy).to.have.been.calledWith(
        sinon.match.string,
        sinon.match({ status: BOARD_STATUS.UPDATING_RANKINGS }),
      );
    });

    it('should get userScores from leaderboard ordered by points', async () => {
      const spy = sinon.spy(userScoreRepoStub, 'findByLeaderboardOrderByPoints$');

      await leaderboardUpdater.updateRankings(seasonId);

      expect(spy).to.have.been.called;
      userScoreRepoStub.findByLeaderboardOrderByPoints$.restore();
    });

    it('should update positions', async () => {
      const spy = sinon.spy(userScoreRepoStub, 'findByIdAndUpdate$');

      const count = await leaderboardUpdater.updateRankings(seasonId);

      expect(spy).to.have.been.called;
      expect(spy.firstCall).to.have.been.calledWith(sinon.match.string, {
        positionNew: 1,
        positionOld: 2,
      });
      expect(spy.secondCall).to.have.been.calledWith(sinon.match.string, {
        positionNew: 2,
        positionOld: 1,
      });
    });
  });

  describe('SetLeaderboardsToRefreshed', () => {
    it('should get leaderboards that have UPDATING_RANKINGS status', async () => {
      const spy = leaderboardRepoStub.findAll$;

      await leaderboardUpdater.markLeaderboardsAsRefreshed(seasonId);

      expect(spy).to.have.been.called;
    });

    it('should change leaderboard status to REFRESHED', async () => {
      const spy = leaderboardRepoStub.findByIdAndUpdate$;

      const count = await leaderboardUpdater.markLeaderboardsAsRefreshed(seasonId);

      expect(spy).to.have.been.called;
      expect(spy).to.have.been.calledWith(
        sinon.match.string,
        sinon.match({ status: BOARD_STATUS.UPDATING_RANKINGS }),
      );
    });
  });
});
