import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { of } from 'rxjs';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import UpdateMatchUseCase from '../../../../../app/api/data/matches/useCases/updateSeasonMatch.useCase';
import { MatchStatus } from '../../../../../db/models/match.model';
import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  MatchRepository,
  MatchRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories';
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('UpdateMatch Use Case', () => {
  let matchRepo: MatchRepository;
  let competitionRepo: CompetitionRepository;
  let seasonRepo: SeasonRepository;

  let respondSpy: unknown;

  const responder = {
    respond: () => {
      return null;
    },
  };

  before(() => {
    competitionRepo = CompetitionRepositoryImpl.getInstance();
    seasonRepo = SeasonRepositoryImpl.getInstance();
    matchRepo = MatchRepositoryImpl.getInstance();
  });

  beforeEach(() => {
    respondSpy = sinon.spy(responder, 'respond');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a match by ID', async () => {
    const match = { id: 'abc123', name: 'Test Match' };
    matchRepo.findOne$ = sinon.stub().returns(of(match));
    const useCase = UpdateMatchUseCase.getInstance(
      responder,
      competitionRepo,
      seasonRepo,
      matchRepo
    );
    const workerDouble = {
      send: sinon.stub(),
    };
    useCase.setBackgroundWorker(workerDouble);
    await useCase.execute({
      competition: 'test-competition',
      matchDetails: {
        gameRound: '',
        matchday: 0,
        status: MatchStatus.CANCELLED,
      },
      season: 'test-season',
      slug: 'test-match',
    });

    expect(workerDouble.send).to.have.been.calledOnce;
  });
});
