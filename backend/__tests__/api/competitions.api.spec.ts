import mongoose = require('mongoose');
import * as http from 'http';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import axios, { AxiosInstance } from 'axios';
import startServer from '../../app/server';
import { setupReqRes } from './testUtils';
import { CompetitionsController } from '../../app/api/competitions/competitions.controller'
import { Competition, CompetitionDocument } from '../../db/models';
import db from '../../db';

import { CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';

chai.use(chaiHttp);
chai.use(sinonChai);
const expect = chai.expect;

let server: http.Server, competitionsAPI: AxiosInstance, baseURL: string;
type Sut = {
  competitions: Competition[]
}
let sut: Partial<Sut> = {};

function clearData() {
  const promises: Promise<any>[] = [];
  promises.push(db.Competition.deleteMany({}).exec())
  return Promise.all(promises);
}

function addCompetitions(competitions: Competition[]): Promise<Competition[]> {
  return new Promise((resolve, reject) => {
    db.Competition.insertMany(competitions, ((err: Error, data: CompetitionDocument[]) => {
      sut.competitions = data.map(c => c.toObject());
      if (err) { return reject(err); }
      resolve(competitions);
    }));
  })
}

async function resetData() {
  const epl: Competition = {
    name: 'English Premier League',
    slug: 'english_premier_league',
    code: 'epl'
  };
  const slg: Competition = {
    name: 'Spanish La Liga',
    slug: 'spanish_la_liga',
    code: 'slg'
  };
  await clearData();
  return await addCompetitions([epl, slg]);
}

describe('Competitions API', function () {
  this.timeout(9999);
  before(done => {
    mongoose.connect(process.env.MONGO_URI!, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connection
      .once('open', () => done())
      .on('error', (error) => {
        console.warn('Error', error);
        done(error);
      })
  })
  beforeEach(done => { resetData().then(() => done()); });
  after(done => { mongoose.disconnect(); done() });

  describe('Competition Routes', function () {
    before(async () => {
      server = await startServer()
      baseURL = `http://localhost:${process.env.PORT}/api`
      competitionsAPI = axios.create({ baseURL })
    })

    after(() => server.close())

    it('should respond with JSON array', async function () {
      const competitions: Competition[] = await competitionsAPI.get('competitions').then(res => res.data)
      expect(competitions).to.be.an.instanceof(Array);
      expect(competitions).to.have.length(2)
      expect(competitions[0].id).to.eql(sut.competitions![0].id);
      expect(competitions[1].id).to.eql(sut.competitions![1].id);
    })
  })

  describe('Competitions Controller', function () {
    const competitionRepo = CompetitionRepositoryImpl.getInstance();
    const competitionsController = new CompetitionsController(competitionRepo);

    it('getCompetitions returns all competitions in the database', async () => {
      const { req, res } = setupReqRes()
      await competitionsController.getCompetitions(<any>req, <any>res)

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0]
      const firstArg = firstCall[0]
      const competitions = firstArg
      expect(competitions.length).to.be.greaterThan(0)
      const actualCompetitions = await competitionRepo.findAll$().toPromise();
      expect(competitions).to.eql(actualCompetitions)
    })
  });
})
