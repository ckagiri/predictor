import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;

import { MatchesScheduler } from '../../app/schedulers/footballApi/matches.scheduler';
import { MatchStatus, MatchEntity } from '../../db/models/match.model';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;
const taskRunnerStub: any = {
  run: async ({ whenToExecute, task = () => {}, context }: any) => {
    await task.call(context);
  },
};

const newMatch = (
  homeTeamName: string,
  awayTeamName: string,
  status: string = MatchStatus.FINISHED,
) => {
  return {
    id: ObjectId().toHexString(),
    slug: `${homeTeamName}V${awayTeamName}`,
    homeTeam: { id: ObjectId().toHexString(), name: homeTeamName },
    awayTeam: { id: ObjectId().toHexString(), name: awayTeamName },
    status,
  } as MatchEntity;
};

const arsVcheTd: MatchEntity = newMatch('Arsenal', 'Chelsea');
const livVsouTd: MatchEntity = newMatch('Liverpool', 'Southampton');
const eveVburYd: MatchEntity = newMatch('Everton', 'Burnley');
const bouVwatTm: MatchEntity = newMatch('Bournemouth', 'Watford');
const apiClientStub: any = {
  getTomorrowsMatches: () => {
    return Promise.resolve({ data: { matches: [bouVwatTm] } });
  },
  getYesterdaysMatches: () => {
    return Promise.resolve({ data: { matches: [eveVburYd] } });
  },
  getTodaysMatches: () => {
    return Promise.resolve({ data: { matches: [arsVcheTd, livVsouTd] } });
  },
};
const matchConverterStub: any = {
  map: (data: any[]) => {
    return data;
  },
};
const matchesUpdaterStub: any = {
  updateGameDetails: (matches: any[]) => {
    return Promise.resolve(matches);
  },
};
const eventMediatorStub: any = {
  publish(event: string, ...args: any[]) {},
};
let matchesScheduler: MatchesScheduler;
describe('ApiFootballData: Matches scheduler', () => {
  beforeEach(() => {
    matchesScheduler = new MatchesScheduler(
      taskRunnerStub,
      apiClientStub,
      matchConverterStub,
      matchesUpdaterStub,
      eventMediatorStub,
    );
  });
  it('should set polling true/false when started/stopped respectively', done => {
    matchesScheduler.start();
    expect(matchesScheduler.IsPolling).to.be.true;
    matchesScheduler.stop();
    matchesScheduler.on('stopped', () => {
      expect(matchesScheduler.IsPolling).to.be.false;
      done();
    });
  });

  it('should run again after polling interval', done => {
    const clock = sinon.useFakeTimers();
    let taskExecutionCount = 0;
    matchesScheduler.start();
    matchesScheduler.on('task:executed', () => {
      taskExecutionCount += 1;
      if (taskExecutionCount === 2) {
        matchesScheduler.stop();
      }
    });
    matchesScheduler.on('stopped', () => {
      expect(taskExecutionCount).to.equal(2);
      done();
    });
    clock.restore();
  });

  it('should call publish process:predictions', done => {
    const clock = sinon.useFakeTimers();
    const spy = sinon.spy(eventMediatorStub, 'publish');
    matchesScheduler.start();
    matchesScheduler.on('task:executed', () => {
      matchesScheduler.stop();
    });
    matchesScheduler.on('stopped', () => {
      expect(spy).to.have.been.called;
      done();
    });
    // todo: tohave been called with first arg, second arg
    clock.restore();
  });

  describe('nextUpdate', () => {
    it('should update after 90secs if any match is IN_PLAY', done => {
      arsVcheTd.status = MatchStatus.IN_PLAY;
      matchesScheduler.start();
      matchesScheduler.on('task:executed', () => {
        matchesScheduler.stop();
      });
      matchesScheduler.on('stopped', () => {
        expect(matchesScheduler.NextUpdate)
          .to.be.at.most(90 * 1000)
          .and.to.be.at.least(89 * 1000);
        done();
      });
    });
    it('should update after 90secs if any match is within 5 mins to kickOff', done => {
      arsVcheTd.status = MatchStatus.TIMED;
      const date = new Date();
      date.setSeconds(+date.getSeconds() + 270);
      arsVcheTd['date'] = date;
      matchesScheduler.start();
      matchesScheduler.on('task:executed', () => {
        matchesScheduler.stop();
      });
      matchesScheduler.on('stopped', () => {
        expect(matchesScheduler.NextUpdate)
          .to.be.at.most(90 * 1000)
          .and.to.be.at.least(89 * 1000);
        done();
      });
    });

    it('should update after 6 hours if earliest kickOff is in 6 hours', done => {
      arsVcheTd.status = MatchStatus.TIMED;
      const date = new Date();
      date.setHours(+date.getHours() + 6);
      arsVcheTd['date'] = date;
      matchesScheduler.start();
      matchesScheduler.on('task:executed', () => {
        matchesScheduler.stop();
      });
      matchesScheduler.on('stopped', () => {
        expect(matchesScheduler.NextUpdate)
          .to.be.at.most(6 * 60 * 60 * 1000)
          .and.to.be.at.least(6 * 60 * 60 * 1000 - 10);
        done();
      });
    });

    it('should update after 12 hours if any kickOff is in after 12 hours', done => {
      arsVcheTd.status = MatchStatus.TIMED;
      const date = new Date();
      date.setHours(+date.getHours() + 15);
      arsVcheTd['date'] = date;
      matchesScheduler.start();
      matchesScheduler.on('task:executed', () => {
        matchesScheduler.stop();
      });
      matchesScheduler.on('stopped', () => {
        expect(matchesScheduler.NextUpdate)
          .to.be.at.most(12 * 60 * 60 * 1000)
          .and.to.be.at.least(12 * 60 * 60 * 1000 - 10);
        done();
      });
    });
  });
});
