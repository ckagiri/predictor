import * as sinon from 'sinon';
import * as chai from 'chai';
const sinonChai = require('sinon-chai');
chai.use(sinonChai);
const expect = chai.expect;
import { Types } from 'mongoose';
const ObjectId = Types.ObjectId;
import { of } from 'rxjs';
import { FootballApiProvider as ApiProvider } from '../../../common/footballApiProvider';
import { MatchStatus } from '../../../db/models/match.model';
import {
  MatchesUpdater,
  MatchesUpdaterImpl,
} from '../../../app/schedulers/footballApi/matches.updater';

const provider = ApiProvider.API_FOOTBALL_DATA;
const newApiMatch = () => {
  return {
    id: 1,
    status: MatchStatus.FINISHED,
    result: {
      goalsHomeTeam: 1,
      goalsAwayTeam: 1,
    },
    odds: null,
  };
};
const newDbMatch = () => {
  return {
    id: ObjectId().toHexString(),
    status: MatchStatus.SCHEDULED,
    externalReference: { [provider]: { id: 1 } },
  };
};

const dbMatch = newDbMatch();
const apiMatch = newApiMatch();
const dbMatches = [dbMatch];
const apiMatches = [apiMatch];

let matchRepoStub: any;
let matchesUpdater: MatchesUpdater;

describe('MatchesUpdaterImpl', () => {
  beforeEach(() => {
    matchRepoStub = {
      FootballApiProvider: provider,
      findByIdAndUpdate$: () => {
        return of(dbMatch);
      },
      findByExternalIds$: () => {
        return of(dbMatches);
      },
    };
    matchesUpdater = new MatchesUpdaterImpl(matchRepoStub);
  });

  describe('Update Game Details', () => {
    it('should update matchResult if changed', async () => {
      const spy = sinon.spy(matchRepoStub, 'findByIdAndUpdate$');

      const res = await matchesUpdater.updateGameDetails(apiMatches);

      expect(spy).to.have.been.calledOnce;

      expect(spy).to.have.been.calledWithMatch(dbMatch.id, {
        result: apiMatch.result,
        status: apiMatch.status,
      });

      matchRepoStub.findByIdAndUpdate$.restore();
    });

    xit('should update matchOdds if changed', () => {});

    xit('should update matchStatus if changed', () => {});

    xit(
      'it should not make update call if result, odds or status hasnt changed',
    );
  });
});
