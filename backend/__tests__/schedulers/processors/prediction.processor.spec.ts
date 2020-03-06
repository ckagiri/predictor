import sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { MatchStatus, Match } from '../../../db/models/match.model';
import { Prediction } from '../../../db/models/prediction.model';

import {
  PredictionProcessor,
  PredictionProcessorImpl,
} from '../../../app/schedulers/prediction.processor';

const newMatch = (
  id: number,
  homeTeamName: string,
  awayTeamName: string,
  status: string = MatchStatus.FINISHED,
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
  } as Match;
};
const chalo = {
  id: ObjectId().toHexString(),
  userName: 'chalo',
};
const kagiri = {
  id: ObjectId().toHexString(),
  userName: 'kagiri',
};
const arsVche = newMatch(1, 'Arsenal', 'Chelsea');
const livVsou = newMatch(2, 'Liverpool', 'Southampton');

const matchRepoStub: any = {
  findSelectableMatches$: () => {
    return of([livVsou]);
  },
};
const userRepoStub: any = {
  findAll$: () => {
    return of([chalo, kagiri]);
  },
};
const chaloJoker = {
  id: ObjectId().toHexString(),
  user: chalo.id,
  match: livVsou.id,
};
const kagiriJoker = {
  id: ObjectId().toHexString(),
  user: kagiri.id,
  match: arsVche.id,
};
const chaloPred = {
  id: ObjectId().toHexString(),
  user: chalo.id,
  match: arsVche.id,
  choice: { goalsHomeTeam: 1, goalsAwayTeam: 1 },
} as Prediction;
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
let predictionProcessor: PredictionProcessor;
describe('Prediction Processor', () => {
  describe('getOrCreatePredictions$', async () => {
    beforeEach(() => {
      predictionRepoStub.findOrCreateJoker$
        .withArgs(sinon.match(chalo.id))
        .returns(of(chaloJoker));
      predictionRepoStub.findOrCreateJoker$
        .withArgs(sinon.match(kagiri.id))
        .returns(of(kagiriJoker));
      predictionRepoStub.findOneOrCreate$.returns(of(chaloPred));
      predictionProcessor = new PredictionProcessorImpl(
        matchRepoStub,
        userRepoStub,
        predictionRepoStub,
        predictionCalculatorStub,
      );
    });

    afterEach(() => {
      predictionRepoStub.findOrCreateJoker$ = sinon.stub();
      predictionRepoStub.findOneOrCreate$ = sinon.stub();
    });

    it('should get the selectable matches of gameRound', async () => {
      const spy = sinon.spy(matchRepoStub, 'findSelectableMatches$');

      await predictionProcessor.getOrCreatePredictions$(arsVche).toPromise();

      expect(spy).to.have.been.calledOnce;
    });

    it('should get all users', async () => {
      const spy = sinon.spy(userRepoStub, 'findAll$');

      await predictionProcessor.getOrCreatePredictions$(arsVche).toPromise();

      expect(spy).to.have.been.calledOnce;
    });

    it('should findOrCreate jokerPrediction for user', async () => {
      const spy = predictionRepoStub.findOrCreateJoker$;

      await predictionProcessor.getOrCreatePredictions$(arsVche).toPromise();

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

    it('should findOrCreate prediction if joker fixure != match passed', async () => {
      const spy = predictionRepoStub.findOneOrCreate$;

      await predictionProcessor.getOrCreatePredictions$(arsVche).toPromise();

      expect(spy).to.have.been.calledOnce;
      expect(spy).to.have.been.calledWith(
        sinon.match({ userId: chalo.id, matchId: arsVche.id }),
      );
    });

    it('should not findOrCreate prediction if joker match == passedIn match', async () => {
      const spy = predictionRepoStub.findOneOrCreate$;

      await predictionProcessor.getOrCreatePredictions$(livVsou).toPromise();

      expect(spy).to.have.been.calledOnce;
    });

    it('should return equal number of predictions to users', async () => {
      const predictions = await predictionProcessor
        .getOrCreatePredictions$(arsVche)
        .toPromise();

      expect(predictions).to.be.an('array');
      expect(predictions.length).to.equal(2);
    });
  });

  describe('processPrediction', () => {
    beforeEach(() => {
      predictionRepoStub.findByIdAndUpdate$.returns(of(chaloPred));
      predictionProcessor = new PredictionProcessorImpl(
        matchRepoStub,
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

      predictionProcessor
        .processPrediction$(chaloPred, arsVche)
        .subscribe(_ => {
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

      predictionProcessor
        .processPrediction$(chaloPred, arsVche)
        .subscribe(_ => {
          expect(spy).to.have.been.called;
          expect(spy).to.have.been.calledWithMatch(chaloPred.id);
          done();
        });
    });
  });
});
