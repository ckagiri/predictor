import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;

import { FixturesScheduler } from '../../src/app/schedulers/footballApi/fixtures.scheduler';
import { FixtureStatus, IFixture } from '../../src/db/models/fixture.model';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;
const taskRunnerStub: any = {
  run: async ({ whenToExecute, task = () => {}, context }: any) => {
    await task.call(context);
  }
};

const newFixture = (
  homeTeamName: string,
  awayTeamName: string,
  status: string = FixtureStatus.FINISHED
) => {
  return {
    id: ObjectId().toHexString(),
    slug: `${homeTeamName}V${awayTeamName}`,
    homeTeam: { id: ObjectId().toHexString(), name: homeTeamName },
    awayTeam: { id: ObjectId().toHexString(), name: awayTeamName },
    status
  } as IFixture;
};

const arsVcheTd: IFixture = newFixture('Arsenal', 'Chelsea');
const livVsouTd: IFixture = newFixture('Liverpool', 'Southampton');
const eveVburYd: IFixture = newFixture('Everton', 'Burnley');
const bouVwatTm: IFixture = newFixture('Bournemouth', 'Watford');
const apiClientStub: any = {
  getTomorrowsFixtures: () => {
    return Promise.resolve({ data: { fixtures: [bouVwatTm] } });
  },
  getYesterdaysFixtures: () => {
    return Promise.resolve({ data: { fixtures: [eveVburYd] } });
  },
  getTodaysFixtures: () => {
    return Promise.resolve({ data: { fixtures: [arsVcheTd, livVsouTd] } });
  }
};
const fixtureConverterStub: any = {
  map: (data: any[]) => {
    return data;
  }
};
const fixturesUpdaterStub: any = {
  updateGameDetails: (fixtures: any[]) => {
    return Promise.resolve(fixtures);
  }
};
const eventMediatorStub: any = {
  publish(event: string, ...args: any[]) {}
};
let fixturesScheduler: FixturesScheduler;
describe('ApiFootballData: Fixtures scheduler', () => {
  beforeEach(() => {
    fixturesScheduler = new FixturesScheduler(
      taskRunnerStub,
      apiClientStub,
      fixtureConverterStub,
      fixturesUpdaterStub,
      eventMediatorStub
    );
  });
  it('should set polling true/false when started/stopped respectively', done => {
    fixturesScheduler.start();
    expect(fixturesScheduler.IsPolling).to.be.true;
    fixturesScheduler.stop();
    fixturesScheduler.on('stopped', () => {
      expect(fixturesScheduler.IsPolling).to.be.false;
      done();
    });
  });

  it('should run again after polling interval', done => {
    const clock = sinon.useFakeTimers();
    let taskExecutionCount = 0;
    fixturesScheduler.start();
    fixturesScheduler.on('task:executed', () => {
      taskExecutionCount += 1;
      if (taskExecutionCount == 2) {
        fixturesScheduler.stop();
      }
    });
    fixturesScheduler.on('stopped', () => {
      expect(taskExecutionCount).to.equal(2);
      done();
    });
    clock.restore();
  });

  it('should call publish process:predictions', done => {
    const clock = sinon.useFakeTimers();
    const spy = sinon.spy(eventMediatorStub, 'publish');
    fixturesScheduler.start();
    fixturesScheduler.on('task:executed', () => {
      fixturesScheduler.stop();
    });
    fixturesScheduler.on('stopped', () => {
      expect(spy).to.have.been.called;
      done();
    });
    //todo: tohave been called with first arg, second arg
    clock.restore();
  });

  describe('nextUpdate', () => {
    it('should update after 90secs if any fixture is IN_PLAY', done => {
      arsVcheTd.status = FixtureStatus.IN_PLAY;
      fixturesScheduler.start();
      fixturesScheduler.on('task:executed', () => {
        fixturesScheduler.stop();
      });
      fixturesScheduler.on('stopped', () => {
        expect(fixturesScheduler.NextUpdate)
          .to.be.at.most(90 * 1000)
          .and.to.be.at.least(89 * 1000);
        done();
      });
    });
    it('should update after 90secs if any fixture is within 5 mins to kickOff', done => {
      arsVcheTd.status = FixtureStatus.TIMED;
      const date = new Date();
      date.setSeconds(+date.getSeconds() + 270);
      arsVcheTd['date'] = date;
      fixturesScheduler.start();
      fixturesScheduler.on('task:executed', () => {
        fixturesScheduler.stop();
      });
      fixturesScheduler.on('stopped', () => {
        expect(fixturesScheduler.NextUpdate)
          .to.be.at.most(90 * 1000)
          .and.to.be.at.least(89 * 1000);
        done();
      });
    });

    it('should update after 6 hours if earliest kickOff is in 6 hours', done => {
      arsVcheTd.status = FixtureStatus.TIMED;
      const date = new Date();
      date.setHours(+date.getHours() + 6);
      arsVcheTd['date'] = date;
      fixturesScheduler.start();
      fixturesScheduler.on('task:executed', () => {
        fixturesScheduler.stop();
      });
      fixturesScheduler.on('stopped', () => {
        expect(fixturesScheduler.NextUpdate)
          .to.be.at.most(6 * 60 * 60 * 1000)
          .and.to.be.at.least(6 * 60 * 60 * 1000 - 10);
        done();
      });
    });

    it('should update after 12 hours if any kickOff is in after 12 hours', done => {
      arsVcheTd.status = FixtureStatus.TIMED;
      const date = new Date();
      date.setHours(+date.getHours() + 15);
      arsVcheTd['date'] = date;
      fixturesScheduler.start();
      fixturesScheduler.on('task:executed', () => {
        fixturesScheduler.stop();
      });
      fixturesScheduler.on('stopped', () => {
        expect(fixturesScheduler.NextUpdate)
          .to.be.at.most(12 * 60 * 60 * 1000)
          .and.to.be.at.least(12 * 60 * 60 * 1000 - 10);
        done();
      });
    });
  });
});
