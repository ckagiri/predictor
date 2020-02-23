import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;

import { FinishedMatchesScheduler } from '../../app/schedulers/finishedMatches.scheduler';
import { MatchesScheduler } from '../../app/schedulers/footballApi/matches.scheduler';

import { EventMediator, EventMediatorImpl } from '../../common/eventMediator';
import { MatchStatus, MatchEntity } from '../../db/models/match.model';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

const taskRunnerStub: any = {
  run: async ({ whenToExecute, task = () => {}, context }: any) => {
    await task.call(context);
  },
};
const matchesProcessorStub: any = {
  processPredictions: (matches: any[]) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 5);
    });
  },
};
const eventMediator: EventMediator = EventMediatorImpl.getInstance();
let finishedMatchesScheduler: FinishedMatchesScheduler;

describe('ApiFootballData: FinishedMatches scheduler', () => {
  beforeEach(() => {
    eventMediator.removeAllListeners();
    finishedMatchesScheduler = new FinishedMatchesScheduler(
      taskRunnerStub,
      matchesProcessorStub,
      eventMediator,
    );
  });
  it('should set polling true/false when started/stopped respectively', done => {
    finishedMatchesScheduler.start();
    expect(finishedMatchesScheduler.IsRunning).to.be.true;
    finishedMatchesScheduler.stop();
    finishedMatchesScheduler.on('stopped', () => {
      expect(finishedMatchesScheduler.IsRunning).to.be.false;
      done();
    });
  });
  describe('on finished matches updated', () => {
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
    const arsVcheTd = newMatch('Arsenal', 'Chelsea');
    const livVsouTd = newMatch('Liverpool', 'Southampton');
    const apiClientStub: any = {
      getTomorrowsMatches: () => {
        return Promise.resolve({ data: { matches: [] } });
      },
      getYesterdaysMatches: () => {
        return Promise.resolve({ data: { matches: [] } });
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
    let matchesScheduler: any;

    beforeEach(() => {
      matchesScheduler = new MatchesScheduler(
        taskRunnerStub,
        apiClientStub,
        matchConverterStub,
        matchesUpdaterStub,
        eventMediator,
      );
    });

    it('should processPredictions', done => {
      const clock = sinon.useFakeTimers();
      const spy = sinon.spy(matchesProcessorStub, 'processPredictions');
      matchesScheduler.start();
      finishedMatchesScheduler.start();
      matchesScheduler.on('task:executed', () => {
        matchesScheduler.stop();
      });
      finishedMatchesScheduler.on('task:executed', () => {
        finishedMatchesScheduler.stop();
      });
      eventMediator.addListener('predictions:processed', () => {
        expect(spy).to.have.been.called;
        done();
      });
      clock.restore();
    });
  });
});
