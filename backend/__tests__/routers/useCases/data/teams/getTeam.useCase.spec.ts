import * as chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { of } from 'rxjs';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { FailureResult } from '../../../../../app/api/common/result';
import GetTeamUseCase from '../../../../../app/api/data/teams/useCases/getTeam.useCase';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../../db/repositories/team.repo';
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('GetTeam Use Case', () => {
  let teamRepo: TeamRepository;
  let respondSpy: unknown;

  const responder = {
    respond: () => {
      return null;
    },
  };

  before(() => {
    teamRepo = TeamRepositoryImpl.getInstance();
  });

  beforeEach(() => {
    respondSpy = sinon.spy(responder, 'respond');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a team by ID', async () => {
    const team = { id: 'abc123', name: 'Test Team' };
    teamRepo.findOne$ = sinon.stub().returns(of(team));
    const useCase = GetTeamUseCase.getInstance(responder, teamRepo);
    await useCase.execute('abc123');

    expect(respondSpy).to.have.been.calledOnceWith(team);
  });

  it('should throw an error if team not found', async () => {
    teamRepo.findOne$ = sinon.stub().returns(of(null));

    const useCase = GetTeamUseCase.getInstance(responder, teamRepo);
    await expect(useCase.execute('fooBar')).to.be.rejectedWith(
      FailureResult,
      'Could not find team with slug fooBar'
    );
    expect(respondSpy).to.not.have.been.called;
  });
});
