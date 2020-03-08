import * as http from 'http';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import axios, { AxiosInstance } from 'axios';
import startServer from '../../app/server';
import { Competition, Season, Team } from '../../db/models';
import db from '../../db';
import memoryDb from '../memoryDb';
import a, { GameData } from '../a';

chai.use(chaiHttp);
chai.use(sinonChai);
const expect = chai.expect;

let server: http.Server, gameAPI: AxiosInstance, baseURL: string;

const liverpool = a.team.name('Liverpool').slug('liverpool');
const chelsea = a.team.name('Chelsea').slug('chelsea');
const manutd = a.team.name('Manchester Utd').slug('man_utd');
const arsenal = a.team.name('Arsenal').slug('arsenal');
const sunderland = a.team.name('Sunderland').slug('sunderland');

const epl = a.competition
  .name('English Premier League')
  .slug('english-premier-league')
  .code('epl')

const epl2019 = a.season
  .withCompetition(epl)
  .name('2018-19')
  .slug('18-19')
  .year(2019)
  .currentMatchRound(20)
  .seasonStart('2018-08-11T00:00:00+0200')
  .seasonEnd('2019-05-13T16:00:00+0200');

const chelseaFan = a.user
  .username("chelseafan")
  .email("chelseafan@gmail.com");

const liverpoolFan = a.user
  .username("liverpoolfan")
  .email("liverpoolfan@gmail.com");

async function setupSimpleGame() {
  const game = await a.game
    .withUsers(
      chelseaFan, liverpoolFan
    )
    .withTeams(
      liverpool, arsenal, chelsea, manutd, sunderland
    )
    .withCompetitions(
      epl
    )
    .withSeasons(
      epl2019
        .withTeams(liverpool, arsenal, chelsea, manutd)
        .withMatches(
          a.match
            .homeTeam(chelsea)
            .awayTeam(manutd)
            .date('2019-02-10T11:30:00Z')
            .gameRound(20)
            .withPredictions(
              a.prediction
                .user(chelseaFan)
                .homeScore(3)
                .awayScore(0)
                .joker(true),
              a.prediction
                .user(liverpoolFan)
                .homeScore(1)
                .awayScore(1)
            ),
          a.match
            .homeTeam(liverpool)
            .awayTeam(arsenal)
            .date('2019-07-10T11:30:00Z')
            .gameRound(21)
            .withPredictions(
              a.prediction
                .user(chelseaFan)
                .homeScore(1)
                .awayScore(0),
              a.prediction
                .user(liverpoolFan)
                .homeScore(2)
                .awayScore(0)
                .joker(true)
            )
        )
    )
    .build();
  return game;
}

describe('Game API', function () {
  this.timeout(9999);
  let simpleGame: GameData;

  before(async () => {
    await memoryDb.connect();
  })

  beforeEach(async () => {
    await memoryDb.dropDb();
    simpleGame = await setupSimpleGame();
  });

  after(async () => {
    await memoryDb.close();
  });

  describe('Competition Routes', function () {
    before(async () => {
      server = await startServer()
      baseURL = `http://localhost:${process.env.PORT}/api`
      gameAPI = axios.create({ baseURL })
    });

    after(async () => {
      await server.close()
    });

    it('should respond with JSON array', async function () {
      const competitions: Competition[] = await gameAPI.get('competitions').then(res => res.data)
      expect(simpleGame).to.be.not.null;
    })
  })
})