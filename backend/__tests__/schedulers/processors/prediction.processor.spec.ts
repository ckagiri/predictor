import sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { FixtureStatus, IFixture } from '../../../db/models/fixture.model';
import { IPrediction } from '../../../db/models/prediction.model';

import {
  IPredictionProcessor,
  PredictionProcessor,
} from '../../../app/schedulers/prediction.processor';

const newFixture = (
  id: number,
  homeTeamName: string,
  awayTeamName: string,
  status: string = FixtureStatus.FINISHED,
) => {
  return {
    id: ObjectId().toHexString(),
    season: '4edd40c86762e0fb12000001',
    slug: `${homeTeamName}V${awayTeamName}`,
    gameRound: 2,
    homeTeam: { id: ObjectId().toHexString(), name: homeTeamName },
    awayTeam: { id: ObjectId().toHexString(), name: homeTeamName },
    status,
    result: { goalsHomeTeam: 2, goalsAwayTeam: 1 },
    externalReference: {
      [ApiProvider.API_FOOTBALL_DATA]: { id },
    },
  } as IFixture;
};
const chalo = {
  id: ObjectId().toHexString(),
  userName: 'chalo',
};
const kagiri = {
  id: ObjectId().toHexString(),
  userName: 'kagiri',
};
const arsVche = newFixture(1, 'Arsenal', 'Chelsea');
const livVsou = newFixture(2, 'Liverpool', 'Southampton');

const fixtureRepoStub: any = {
  findSelectableFixtures$: () => {
    return of([livVsou]);
  },
};
const userRepoStub: any = {
  findAll$: () => {
    return of([chalo, kagiri]);
  },
};
const chaloJoker = { id: ObjectId().toHexString(), user: chalo.id, fixture: livVsou.id };
const kagiriJoker = { id: ObjectId().toHexString(), user: kagiri.id, fixture: arsVche.id };
const chaloPred = {
  id: ObjectId().toHexString(),
  user: chalo.id,
  fixture: arsVche.id,
  choice: { goalsHomeTeam: 1, goalsAwayTeam: 1 },
} as IPrediction;
const predictionRepoStub: any = {
  findOrCreateJoker$: sinon.stub(),
  findOneOrCreate$: sinon.stub(),
  findByIdAndUpdate$: sinon.stub(),
};
const predictionCalculatorStub: any = {
  calculateScore: () => {
    return { points: 9 };
  },
};
let predictionProcessor: IPredictionProcessor;
describe('Prediction Processor', () => {
  describe('getPredictions$', async () => {
    beforeEach(() => {
      predictionRepoStub.findOrCreateJoker$.withArgs(sinon.match(chalo.id)).returns(of(chaloJoker));
      predictionRepoStub.findOrCreateJoker$
        .withArgs(sinon.match(kagiri.id))
        .returns(of(kagiriJoker));
      predictionRepoStub.findOneOrCreate$.returns(of(chaloPred));
      predictionProcessor = new PredictionProcessor(
        fixtureRepoStub,
        userRepoStub,
        predictionRepoStub,
        predictionCalculatorStub,
      );
    });

    afterEach(() => {
      predictionRepoStub.findOrCreateJoker$ = sinon.stub();
      predictionRepoStub.findOneOrCreate$ = sinon.stub();
    });

    it('should get the selectable fixtures of gameRound', async () => {
      const spy = sinon.spy(fixtureRepoStub, 'findSelectableFixtures$');

      await predictionProcessor.getPredictions$(arsVche).toPromise();

      expect(spy).to.have.been.calledOnce;
    });

    it('should get all users', async () => {
      const spy = sinon.spy(userRepoStub, 'findAll$');

      await predictionProcessor.getPredictions$(arsVche).toPromise();

      expect(spy).to.have.been.calledOnce;
    });

    it('should findOrCreate jokerPrediction for user', async () => {
      const spy = predictionRepoStub.findOrCreateJoker$;

      await predictionProcessor.getPredictions$(arsVche).toPromise();

      expect(spy).to.have.been.calledTwice;
      expect(spy.firstCall).to.have.been.calledWithExactly(
        chalo.id,
        arsVche.season,
        arsVche.gameRound,
        [livVsou.id, arsVche.id],
      );
      expect(spy.secondCall).to.have.been.calledWithExactly(
        kagiri.id,
        arsVche.season,
        arsVche.gameRound,
        [livVsou.id, arsVche.id],
      );
    });

    it('should findOrCreate prediction if joker fixure != fixture passed', async () => {
      const spy = predictionRepoStub.findOneOrCreate$;

      await predictionProcessor.getPredictions$(arsVche).toPromise();

      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith(sinon.match({ userId: chalo.id, fixtureId: arsVche.id }));
    });

    it('should not findOrCreate prediction if joker fixture == passedIn fixture', async () => {
      const spy = predictionRepoStub.findOneOrCreate$;

      await predictionProcessor.getPredictions$(livVsou).toPromise();

      expect(spy).to.have.been.calledOnce;
    });

    it('should return equal number of predictions to users', async () => {
      const predictions = await predictionProcessor.getPredictions$(arsVche).toPromise();

      expect(predictions).to.be.an('array');
      expect(predictions.length).to.equal(2);
    });
  });

  describe('processPrediction', () => {
    beforeEach(() => {
      predictionRepoStub.findByIdAndUpdate$.returns(of(chaloPred));
      predictionProcessor = new PredictionProcessor(
        fixtureRepoStub,
        userRepoStub,
        predictionRepoStub,
        predictionCalculatorStub,
      );
    });
    afterEach(() => {
      predictionRepoStub.findByIdAndUpdate$ = sinon.stub();
    });

    it('should calculate score for prediction', done => {
      const spy = sinon.spy(predictionCalculatorStub, 'calculateScore');

      predictionProcessor.processPrediction$(chaloPred, arsVche).subscribe(_ => {
        expect(spy).to.have.been.calledOnce;
        expect(spy).to.have.been.calledWith(
          { goalsHomeTeam: 1, goalsAwayTeam: 1 },
          { goalsHomeTeam: 2, goalsAwayTeam: 1 },
        );
        done();
      });
    });

    it('should save calculatedScore for prediction', done => {
      const spy = predictionRepoStub.findByIdAndUpdate$;

      predictionProcessor.processPrediction$(chaloPred, arsVche).subscribe(_ => {
        expect(spy).to.have.been.called;
        expect(spy).to.have.been.calledWithMatch(chaloPred.id);
        done();
      });
    });
  });
});
