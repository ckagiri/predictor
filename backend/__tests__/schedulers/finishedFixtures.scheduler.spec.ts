import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;

import { FinishedFixturesScheduler } from '../../app/schedulers/finishedFixtures.scheduler';
import { FixturesScheduler } from '../../app/schedulers/footballApi/fixtures.scheduler';

import { IEventMediator, EventMediator } from '../../common/eventMediator';
import { FixtureStatus, IFixture } from '../../db/models/fixture.model';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

const taskRunnerStub: any = {
  run: async ({ whenToExecute, task = () => { }, context }: any) => {
    await task.call(context);
  }
};
const fixturesProcessorStub: any = {
  processPredictions: (fixtures: any[]) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5);
    });
  }
};
const eventMediator: IEventMediator = EventMediator.getInstance();
let finishedFixturesScheduler: FinishedFixturesScheduler;

describe('ApiFootballData: FinishedFixtures scheduler', () => {
  beforeEach(() => {
    eventMediator.removeAllListeners();
    finishedFixturesScheduler = new FinishedFixturesScheduler(
      taskRunnerStub,
      fixturesProcessorStub,
      eventMediator
    );
  });
  it('should set polling true/false when started/stopped respectively', done => {
    finishedFixturesScheduler.start();
    expect(finishedFixturesScheduler.IsRunning).to.be.true;
    finishedFixturesScheduler.stop();
    finishedFixturesScheduler.on('stopped', () => {
      expect(finishedFixturesScheduler.IsRunning).to.be.false;
      done();
    });
  });
  describe('on finished fixtures updated', () => {
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
    const arsVcheTd = newFixture('Arsenal', 'Chelsea');
    const livVsouTd = newFixture('Liverpool', 'Southampton');
    const apiClientStub: any = {
      getTomorrowsFixtures: () => {
        return Promise.resolve({ data: { fixtures: [] } });
      },
      getYesterdaysFixtures: () => {
        return Promise.resolve({ data: { fixtures: [] } });
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
    let fixturesScheduler: any;

    beforeEach(() => {
      fixturesScheduler = new FixturesScheduler(
        taskRunnerStub,
        apiClientStub,
        fixtureConverterStub,
        fixturesUpdaterStub,
        eventMediator
      );
    });

    it('should processPredictions', done => {
      const clock = sinon.useFakeTimers();
      const spy = sinon.spy(fixturesProcessorStub, 'processPredictions');
      fixturesScheduler.start();
      finishedFixturesScheduler.start();
      fixturesScheduler.on('task:executed', () => {
        fixturesScheduler.stop();
      });
      finishedFixturesScheduler.on('task:executed', () => {
        finishedFixturesScheduler.stop();
      });
      eventMediator.addListener('predictions:processed', () => {
        expect(spy).to.have.been.called;
        done();
      });
      clock.restore();
    });
  });
});
