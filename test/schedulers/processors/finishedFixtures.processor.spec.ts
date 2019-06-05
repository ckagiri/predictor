import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;

import { FootballApiProvider as ApiProvider } from '../../../src/common/footballApiProvider';
import { FixtureStatus, IFixture } from '../../../src/db/models/fixture.model';
import { PredictionStatus } from '../../../src/db/models/prediction.model';
import {
  IFinishedFixturesProcessor,
  FinishedFixturesProcessor
} from '../../../src/app/schedulers/finishedFixtures.processor';

const newFixture = (
  id: any,
  homeTeamName: string,
  awayTeamName: string,
  status: string = FixtureStatus.FINISHED
) => {
  return {
    id: ObjectId().toHexString(),
    season: '4edd40c86762e0fb12000001',
    gameRound: 2,
    slug: `${homeTeamName}V${awayTeamName}`,
    homeTeam: { id: ObjectId().toHexString(), name: homeTeamName },
    awayTeam: { id: ObjectId().toHexString(), name: awayTeamName },
    status,
    result: { goalsHomeTeam: 2, goalsAwayTeam: 1 },
    allPredictionsProcessed: false,
    externalReference: {
      [ApiProvider.API_FOOTBALL_DATA]: { id }
    }
  } as IFixture;
};
const arsVche = newFixture(1, 'Arsenal', 'Chelsea');
const livVsou = newFixture(2, 'Liverpool', 'Southampton');
const eveVwat = newFixture(3, 'Everton', 'Watford', FixtureStatus.IN_PLAY);
const bouVwat = newFixture(4, 'Bournemouth', 'Watford');
bouVwat.allPredictionsProcessed = true;
const finishedFixtures = [arsVche, livVsou, eveVwat, bouVwat];
const chalo = ObjectId().toHexString();
const kag = ObjectId().toHexString();
const newPrediction = (userId: string, fixture: IFixture, status = PredictionStatus.PENDING) => {
  return {
    user: userId,
    fixture,
    status,
    choice: { goalsHomeTeam: 1, goalsAwayTeam: 1 }
  };
};
const pred1 = newPrediction(chalo, arsVche);
const pred2 = newPrediction(kag, arsVche, PredictionStatus.PROCESSED);
const pred3 = newPrediction(chalo, livVsou);
const pred4 = newPrediction(kag, livVsou);

const predictionProcessorStub: any = {
  getPredictions$: sinon.stub(),
  processPrediction$: sinon.stub()
};
const fixtureRepoStub: any = {
  findByIdAndUpdate$: () => {
    return of({});
  }
};

let finishedFixturesProcessor: IFinishedFixturesProcessor;

describe.only('Finished Fixtures', () => {
  describe('processPredictions', () => {
    beforeEach(() => {
      predictionProcessorStub.getPredictions$
        .withArgs(sinon.match(arsVche))
        .returns(of([pred1, pred2]));
      predictionProcessorStub.getPredictions$
        .withArgs(sinon.match(livVsou))
        .returns(of([pred3, pred4]));

      predictionProcessorStub.processPrediction$.returns(of(pred1));
      finishedFixturesProcessor = new FinishedFixturesProcessor(
        predictionProcessorStub,
        fixtureRepoStub
      );
    });
    afterEach(() => {
      predictionProcessorStub.getPredictions$ = sinon.stub();
      predictionProcessorStub.processPrediction$ = sinon.stub();
    });
    it('should getPredictions for FINISHED but not AllPredictionsProcessed fixture', async () => {
      const spy = predictionProcessorStub.getPredictions$;

      await finishedFixturesProcessor.processPredictions(finishedFixtures);

      expect(spy).to.have.been.calledTwice;
    });

    it('should process PENDING predictions', async () => {
      const spy = predictionProcessorStub.processPrediction$;

      await finishedFixturesProcessor.processPredictions(finishedFixtures);

      expect(spy).to.have.callCount(3);
    });
  });

  describe('setToTrueAllPredictionsProcessed', () => {});
});
