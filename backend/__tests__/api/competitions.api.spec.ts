import mongoose = require('mongoose');
import * as chai from 'chai';
import * as http from 'http';
import chaiHttp = require('chai-http');
chai.use(chaiHttp);
import { CompetitionModel, Competition, CompetitionDocument } from '../../db/models/competition.model';
import axios, { AxiosInstance } from 'axios';
import startServer from '../../app/server';
import { expect } from 'chai';

let server: http.Server, competitionsAPI: AxiosInstance, baseURL: string;
type Sut = {
  competitions: CompetitionModel[]
}
let sut: Partial<Sut> = {};

function clearData() {
  const promises: Promise<any>[] = [];
  promises.push(Competition.deleteMany({}).exec())
  return Promise.all(promises);
}

function addCompetitions(competitions: CompetitionModel[]): Promise<CompetitionModel[]> {
  return new Promise((resolve, reject) => {
    Competition.insertMany(competitions, ((err: Error, data: CompetitionDocument[]) => {
      sut.competitions = data.map(c => c.toObject());
      if (err) { return reject(err); }
      resolve(competitions);
    }));
  })
}

async function resetData() {
  const epl: CompetitionModel = {
    name: 'English Premier League',
    slug: 'english_premier_league',
    code: 'epl'
  };
  const slg: CompetitionModel = {
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

  describe.only('Competition Routes', function () {
    before(async () => {
      server = await startServer()
      baseURL = `http://localhost:${process.env.PORT}/api`
      competitionsAPI = axios.create({ baseURL })
    })

    after(() => server.close())

    it('should respond with JSON array', async function () {
      const competitions: CompetitionModel[] = await competitionsAPI.get('competitions').then(res => res.data)
      expect(competitions).to.be.an.instanceof(Array);
      expect(competitions).to.have.length(2)
      expect(competitions[0].id).to.eql(sut.competitions![0].id);
      expect(competitions[1].id).to.eql(sut.competitions![1].id);
    })
  })
})
