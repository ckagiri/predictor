import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;

import { SeasonScheduler } from '../../src/app/schedulers/footballApi/season.scheduler';

const taskRunnerStub: any = {
  run: async ({ whenToExecute, task = () => {}, context }: any) => {
    await task.call(context);
  }
};
const apiClientStub: any = {
  getCompetitions: () => {
    return Promise.resolve();
  }
};
const seasonConverterStub: any = {
  map: (data: any) => {
    return data;
  }
};
const seasonUpdaterStub: any = {
  updateCurrentMatchRound: () => {
    return Promise.resolve();
  }
};
const eventMediatorStub: any = sinon.stub();

let seasonScheduler: any;

describe('ApiFootballData: Season scheduler', () => {
  beforeEach(() => {
    seasonScheduler = new SeasonScheduler(
      taskRunnerStub,
      apiClientStub,
      seasonConverterStub,
      seasonUpdaterStub,
      eventMediatorStub
    );
  });
  describe('start', () => {
    const POLLING_INTERVAL = 24 * 60 * 60 * 1000;

    it('should set polling true/false when started/stopped respectively', done => {
      seasonScheduler.start();
      expect(seasonScheduler.IsPolling).to.be.true;
      seasonScheduler.stop();
      seasonScheduler.on('stopped', () => {
        expect(seasonScheduler.IsPolling).to.be.false;
        done();
      });
    });

    it('should run again after polling interval', done => {
      const clock = sinon.useFakeTimers();
      const spy = sinon.spy(seasonScheduler, 'onTaskExecuted');
      let count = 0;
      seasonScheduler.start();
      seasonScheduler.on('task:executed', () => {
        count += 1;
        if (count === 2) {
          seasonScheduler.stop();
        }
      });
      seasonScheduler.on('stopped', () => {
        expect(spy).to.have.callCount(2);
        expect(seasonScheduler.PollingInterval).to.equal(POLLING_INTERVAL); //24hours
        done();
      });
      clock.restore();
    });

    it('should getCompetitions from apiClient', done => {
      const clock = sinon.useFakeTimers();
      const spy = sinon.spy(apiClientStub, 'getCompetitions');
      seasonScheduler.start();
      seasonScheduler.on('task:executed', () => {
        seasonScheduler.stop();
      });
      seasonScheduler.on('stopped', () => {
        expect(spy).to.have.been.called;
        done();
      });
      clock.restore();
    });

    it('should update seasons', done => {
      const clock = sinon.useFakeTimers();
      const spy = sinon.spy(seasonUpdaterStub, 'updateCurrentMatchRound');
      seasonScheduler.start();
      seasonScheduler.on('task:executed', () => {
        seasonScheduler.stop();
      });
      seasonScheduler.on('stopped', () => {
        expect(spy).to.have.been.called;
        done();
      });
      clock.restore();
    });
  });
});
