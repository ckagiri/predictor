import * as sinon from 'sinon';
import * as chai from 'chai';
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;
import { of } from 'rxjs';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { FixtureStatus } from '../../../db/models/fixture.model';
import {
  IFixturesUpdater,
  FixturesUpdater,
} from '../../../app/schedulers/footballApi/fixtures.updater';

const provider = ApiProvider.API_FOOTBALL_DATA;
const newApiFixture = () => {
  return {
    id: 1,
    status: FixtureStatus.FINISHED,
    result: {
      goalsHomeTeam: 1,
      goalsAwayTeam: 1,
    },
    odds: null,
  };
};
const newDbFixture = () => {
  return {
    id: ObjectId().toHexString(),
    status: FixtureStatus.SCHEDULED,
    externalReference: { [provider]: { id: 1 } },
  };
};

const dbFixture = newDbFixture();
const apiFixture = newApiFixture();
const dbFixtures = [dbFixture];
const apiFixtures = [apiFixture];

let fixtureRepoStub: any;
let fixturesUpdater: IFixturesUpdater;

describe('FixturesUpdater', () => {
  beforeEach(() => {
    fixtureRepoStub = {
      Provider: provider,
      findByIdAndUpdate$: () => {
        return of(dbFixture);
      },
      findByExternalIds$: () => {
        return of(dbFixtures);
      },
    };
    fixturesUpdater = new FixturesUpdater(fixtureRepoStub);
  });

  describe('Update Game Details', () => {
    it('should update matchResult if changed', async () => {
      const spy = sinon.spy(fixtureRepoStub, 'findByIdAndUpdate$');

      const res = await fixturesUpdater.updateGameDetails(apiFixtures);

      expect(spy).to.have.been.calledOnce;

      expect(spy).to.have.been.calledWithMatch(dbFixture.id, {
        result: apiFixture.result,
        status: apiFixture.status,
      });

      fixtureRepoStub.findByIdAndUpdate$.restore();
    });

    xit('should update matchOdds if changed', () => { });

    xit('should update matchStatus if changed', () => { });

    xit('it should not make update call if result, odds or status hasnt changed');
  });
});
