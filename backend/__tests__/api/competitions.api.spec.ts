import mongoose = require('mongoose');
import * as chai from 'chai';
import * as http from 'http';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);
import { CompetitionModel, Competition } from '../../db/models/competition.model';
import axios, { AxiosInstance } from 'axios';
import startServer from '../../app/server';
import { expect } from 'chai';

let server: http.Server, competitionsAPI: AxiosInstance, competition, baseURL: string;

function clearData(done: Function) {
  const promises: Promise<any>[] = [];
  promises.push(Competition.remove({}).exec())
  Promise.all(promises).then(() => done());
}

function addCompetition(aCompetition: CompetitionModel) {
  return new Promise((resolve, reject) => {
    new Competition(aCompetition).save((err: Error, competition: CompetitionModel) => {
      if (err) { return reject(err); }
      resolve(competition);
    })
  })
}

async function resetData() {
  const aCompetition: CompetitionModel = {
    name: 'English Premier League',
    slug: 'english_premier_league',
    code: 'epl'
  };
  const c = await addCompetition(aCompetition);
  competition = c;
}

describe('Competitions API', function () {
  this.timeout(5000);
  before(done => {
    mongoose.connect(process.env.MONGO_URI!);
    mongoose.connection
      .once('open', () => clearData(done))
      .on('error', (error) => {
        console.warn('Error', error);
        done(error);
      })
  })
  beforeEach(done => resetData().then(done));
  afterEach(done => {
    clearData(done);
  });
  after(done => { mongoose.disconnect(); done() });

  describe('Competitions Routes', function () {
    before(async () => {
      server = await startServer()
      baseURL = `http://localhost:${process.env.PORT}/api`
      competitionsAPI = axios.create({ baseURL })
    })

    after(() => server.close())

    it('should respond with JSON array', async function () {

      const { competitions } = await competitionsAPI.get('competitions').then(res => res.data)
      expect(competitions).to.be.an.instanceof(Array)
    })
  })
})
