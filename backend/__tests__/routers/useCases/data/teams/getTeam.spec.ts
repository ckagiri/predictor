import * as chai from 'chai';
import { expect } from 'chai';
import { of } from 'rxjs';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { ValueNotFoundError } from '../../../../../app/api/common/errors';
import { FailureResult } from '../../../../../app/api/common/result/mod';
import GetTeamUseCase from '../../../../../app/api/data/teams/getTeam.useCase';
import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../../db/repositories/team.repo';
chai.use(sinonChai);

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
    respondSpy = sinon.spy(responder, 'respond');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return a team by ID', async () => {
    const team = { id: 'abc123', name: 'Test Team' };
    teamRepo.findById$ = sinon.stub().returns(of(team));
    const useCase = GetTeamUseCase.getInstance(responder, teamRepo);
    await useCase.execute('abc123');

    expect(respondSpy).to.have.been.calledOnceWith(team);
  });

  it('should throw an error if team not found', async () => {
    teamRepo.findById$ = sinon.stub().returns(of(null));
    const respondSpy = sinon.spy(responder, 'respond');

    const useCase = GetTeamUseCase.getInstance(responder, teamRepo);
    try {
      await useCase.execute('fooBar');
    } catch (err: unknown) {
      expect(err).to.be.an.instanceOf(FailureResult);
      expect(err).to.have.property('message', 'Not Found');
      expect(err)
        .to.have.property('error')
        .that.is.an.instanceOf(ValueNotFoundError)
        .which.has.property('message', 'Could not find team with id fooBar');
    }
    expect(respondSpy).to.not.have.been.called;
  });
});
