import { expect } from 'chai';

import { PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import { Match, Prediction, PredictionDocument } from '../../db/models';
import { ScorePoints } from '../../common/score';
import a from '../a';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import memoryDb from '../memoryDb';
import { flatMap } from 'rxjs/operators';

const predictionRepo = PredictionRepositoryImpl.getInstance();
const epl = a.competition
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const epl2022 = a.season
  .withCompetition(epl)
  .setName('2021-2022')
  .setSlug('2021-22')
  .setYear(2022)
  .setSeasonStart('2021-08-09T00:00:00+0200')
  .setSeasonEnd('2022-05-17T16:00:00+0200')
  .setExternalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  })

const manu = a.team.setName('Manchester United').setSlug('man-utd');
const manc = a.team.setName('Manchester City').setSlug('man-city');
const che = a.team.setName('Chelsea').setSlug('chelsea');
const ars = a.team.setName('Arsenal').setSlug('arsenal');

const gw1 = a.gameRound.setName('Gameweek 1').setPosition(1);
const gw2 = a.gameRound.setName('Gameweek 2').setPosition(2);

const manuVmanc = a.match
  .withHomeTeam(manu)
  .withAwayTeam(manc)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)

const cheVars = a.match
  .withHomeTeam(che)
  .withAwayTeam(ars)
  .setDate('2021-08-21T11:30:00Z')
  .withGameRound(gw2)

const user1 = a.user.setUsername('charles').setEmail('charles@email.com');
const user2 = a.user.setUsername('kagiri').setEmail('kagiri@email.com');

describe('Prediction repo', function () {
  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  beforeEach(async () => {
    await a.game
      .withTeams(manu, manc, che, ars)
      .withUsers(user1, user2)
      .withCompetitions(epl)
      .withSeasons(
        epl2022
          .withTeams(manu, manc, che, ars)
          .withGameRounds(gw1, gw2)
          .withMatches(manuVmanc, cheVars)
      )
      .build();
  })

  describe('finders', () => {
    it('findOneOrCreate should create prediction if it doesnt exist', done => {
      const userId = user1.id;
      const { id: matchId, slug: matchSlug, season: seasonId } = manuVmanc.match as Required<Match>;

      predictionRepo
        .findOneOrCreate$({ userId, matchId })
        .subscribe(p => {
          expect(p.user.toString()).to.equal(userId);
          expect(p.match.toString()).to.equal(matchId);
          expect(p.matchSlug).to.equal(matchSlug);
          expect(p.season?.toString()).to.equal(seasonId);
          expect(p).to.have.property('hasJoker', false);
          done();
        });
    });

    it('findOneOrCreate should return existing prediction', done => {
      let prediction: Prediction;
      const userId = user1.id;
      const matchId = manuVmanc.id;

      predictionRepo
        .findOneOrCreate$({ userId, matchId })
        .pipe(
          flatMap(p => {
            prediction = p;
            return predictionRepo.findOneOrCreate$({ userId, matchId });
          })
        )
        .subscribe(p => {
          // do a deep object comparison for equality test
          expect((p as PredictionDocument).toObject()).to.eql(
            (prediction as PredictionDocument).toObject(),
          );
          done();
        });
    });

    it('should find prediction by user and match', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const { slug: matchSlug, season } = manuVmanc.match as Required<Match>;
      let prediction: Prediction;
      const predData: Prediction = {
        user: userId,
        match: matchId,
        matchSlug,
        season,
        choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
      };
      predictionRepo.insert$(predData)
        .pipe(
          flatMap(p => {
            prediction = p;
            return predictionRepo.findOne$({ userId, matchId })
          })
        )
        .subscribe(p => {
          expect(p.id).to.equal(prediction.id);
          done();
        });
    });

    it('should findById And update score', done => {
      let scorePoints: ScorePoints;
      const userId = user1.id;
      const matchId = manuVmanc.id;

      predictionRepo
        .findOneOrCreate$({ userId, matchId })
        .pipe(
          flatMap(p => {
            scorePoints = {
              points: 16,
              APoints: 14,
              BPoints: 2,
              CorrectMatchOutcomePoints: 7,
              ExactGoalDifferencePoints: 1,
              ExactMatchScorePoints: 6,
              CloseMatchScorePoints: 0,
              ExactTeamScorePoints: 2,
            };
            return predictionRepo.findByIdAndUpdate$(p.id!, { scorePoints });
          }),
        )
        .subscribe(p => {
          const pred = (p as PredictionDocument).toObject() as Prediction;
          expect(pred.scorePoints).to.eql(scorePoints);
          done();
        });
    });

    describe('findOrCreateJoker', () => {
      it('should create joker if it doesnt exist', done => {
        const userId = user1.id;
        const gameRoundId = gw1.id;
        const matchId = manuVmanc.id;

        predictionRepo
          .findOrCreateJoker$(
            userId,
            gameRoundId,
            [matchId],
          )
          .subscribe(p => {
            expect(p).to.have.property('hasJoker', true);
            expect(p).to.have.property('jokerAutoPicked', true);
            done();
          });
      });
    });
  });
});
