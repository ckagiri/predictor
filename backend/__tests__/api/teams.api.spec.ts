// import * as http from 'http';
// import * as chai from 'chai';
// import sinonChai from 'sinon-chai';
// import chaiHttp = require('chai-http');
// import axios, { AxiosInstance } from 'axios';
// import { setupReqRes } from './testUtils';
// import { TeamsController } from '../../app/api/teams/teams.controller';
// import { Team } from '../../db/models';
// import memoryDb from '../memoryDb';
// import a, { GameData } from '../a';
// import { TeamRepositoryImpl } from '../../db/repositories/team.repo';
// import startServer from '../../app/server';
// import { lastValueFrom } from 'rxjs';

// chai.use(chaiHttp);
// chai.use(sinonChai);
// const expect = chai.expect;

// let server: http.Server, teamsAPI: AxiosInstance, baseURL: string;

// const epl = a.competition
//   .setName('English Premier League')
//   .setSlug('english-premier-league')
//   .setCode('epl');

// const epl2020 = a.season
//   .withCompetition(epl)
//   .setName('2019-2020')
//   .setSlug('2019-20')
//   .setYear(2020)
//   .setCurrentMatchRound(20)
//   .setSeasonStart('2019-08-09T00:00:00+0200')
//   .setSeasonEnd('2020-05-17T16:00:00+0200');

// const liverpool = a.team.setName('Liverpool').setSlug('liverpool');
// const chelsea = a.team.setName('Chelsea').setSlug('chelsea');
// const sunderland = a.team.setName('Sunderland').setSlug('sunderland');

// async function setupGameData() {
//   const gameData = await a.game
//     .withTeams(liverpool, chelsea, sunderland)
//     .withCompetitions(epl)
//     .withSeasons(epl2020.withTeams(liverpool, chelsea))
//     .build();
//   return gameData;
// }

// describe('Teams API', function () {
//   let gameData: GameData;

//   before(async () => {
//     await memoryDb.connect();
//   });

//   beforeEach(async () => {
//     await memoryDb.dropDb();
//     gameData = await setupGameData();
//   });

//   after(async () => {
//     await memoryDb.close();
//   });

//   describe('Teams Controller', function () {
//     const teamRepo = TeamRepositoryImpl.getInstance();
//     const teamsController = new TeamsController(teamRepo);

//     it('getTeams returns all teams in the database', async () => {
//       const { req, res } = setupReqRes();
//       await teamsController.getTeams(<any>req, <any>res);

//       expect(res.json).to.have.been.called;
//       const firstCall = res.json.args[0];
//       const firstArg = firstCall[0];
//       const teams = firstArg;
//       expect(teams.length).to.be.greaterThan(0);
//       const actualTeams = await teamRepo.findAll$().toPromise();
//       expect(teams).to.eql(actualTeams);
//     });

//     it('getTeams returns all teams in the database for provided season', async () => {
//       const { req, res } = setupReqRes();
//       const seasonId = gameData.seasons[0].id;
//       req.query.seasonId = seasonId;
//       await teamsController.getTeams(<any>req, <any>res);

//       expect(res.json).to.have.been.called;
//       const firstCall = res.json.args[0];
//       const firstArg = firstCall[0];
//       const teams = firstArg;
//       expect(teams.length).to.equal(2);
//       const seasonTeams = await lastValueFrom(teamRepo.getAllBySeason$(seasonId!));
//       expect(seasonTeams).to.have.length(2);
//     });
//   });

//   describe('Team Routes', function () {
//     before(async () => {
//       server = await startServer();
//       baseURL = `http://localhost:${process.env.PORT}/api`;
//       teamsAPI = axios.create({ baseURL });
//     });

//     after(() => {
//       server.close();
//     });

//     it('should respond with JSON array for all teams', async function () {
//       const teams: Team[] = await teamsAPI.get('teams').then(res => res.data);
//       expect(teams).to.be.an.instanceof(Array);
//       expect(teams).to.have.length(3);
//     });

//     it('should respond with JSON array for season teams', async function () {
//       const teams: Team[] = await teamsAPI
//         .get(`teams/?seasonId=${gameData.seasons[0].id}`)
//         .then(res => res.data);
//       expect(teams).to.be.an.instanceof(Array);
//       expect(teams).to.have.length(2);
//       expect(teams.map(c => c.slug)).to.contain('liverpool');
//       expect(teams.map(c => c.slug)).to.contain('chelsea');
//     });
//   });
// });
