import * as sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;

import { TaskRunnerImpl } from '../../app/schedulers/taskRunner';

describe('TaskRunnerImpl', () => {
  let taskRunner: TaskRunnerImpl;

  describe('run', () => {
    beforeEach(() => {
      taskRunner = new TaskRunnerImpl();
    });
    it('should call begin', () => {
      const stub = sinon.stub();
      taskRunner.on('begin', stub);
      expect(stub.called).to.be.false;

      taskRunner.run({});
      expect(stub.calledOnce).to.be.true;
      expect(stub.callCount).to.equal(1);
    });

    it('should not call end before waiting delay', done => {
      const stub = sinon.stub();
      taskRunner.on('end', stub);

      taskRunner.run({
        whenToExecute: 15,
      });
      setTimeout(() => {
        expect(stub.called).to.be.false;
        done();
      }, 5);
    });

    it('should call end after waiting delay', done => {
      const stub = sinon.stub();
      taskRunner.on('end', stub);

      taskRunner.run({
        whenToExecute: 5,
      });
      setTimeout(() => {
        expect(stub.called).to.be.true;
        done();
      }, 15);
    });

    it('should not call end before executing task', done => {
      const stub = sinon.stub();
      taskRunner.on('end', stub);

      taskRunner.run({
        whenToExecute: 5,
        task: () => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const res = 'result';
              resolve(res);
            }, 25);
          });
        },
      });

      setTimeout(() => {
        expect(stub.called).to.be.false;
        done();
      }, 15);
    });

    it('should call end after executing task', done => {
      const stub = sinon.stub();
      taskRunner.on('end', stub);

      taskRunner.run({
        whenToExecute: 5,
        task: () => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(null);
            }, 5);
          });
        },
      });

      setTimeout(() => {
        expect(stub.called).to.be.true;
        done();
      }, 20);
    });

    it('should call data after taskExecution', done => {
      const stub = sinon.stub();
      taskRunner.on('data', stub);

      taskRunner.run({
        whenToExecute: 5,
        task: () => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              const res = 'result';
              resolve(res);
            }, 15);
          });
        },
      });

      setTimeout(() => {
        expect(stub.called).to.be.true;
        expect(stub.calledWith('result')).to.be.true;
        done();
      }, 30);
    });
  });
});
