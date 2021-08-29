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
  .name('English Premier League')
  .slug('english-premier-league')
  .code('epl');

const epl2022 = a.season
  .withCompetition(epl)
  .name('2021-2022')
  .slug('2021-22')
  .year(2022)
  .seasonStart('2021-08-09T00:00:00+0200')
  .seasonEnd('2022-05-17T16:00:00+0200')
  .externalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  })

const manu = a.team.name('Manchester United').slug('man-utd');
const manc = a.team.name('Manchester City').slug('man-city');
const che = a.team.name('Chelsea').slug('chelsea');
const ars = a.team.name('Arsenal').slug('arsenal');

const gw1 = a.gameRound.name('Gameweek 1').position(1);
const gw2 = a.gameRound.name('Gameweek 2').position(2);

const manuVmanc = a.match
  .withHomeTeam(manu)
  .withAwayTeam(manc)
  .date('2021-08-11T11:30:00Z')
  .withGameRound(gw1)

const cheVars = a.match
  .withHomeTeam(che)
  .withAwayTeam(ars)
  .date('2021-08-21T11:30:00Z')
  .withGameRound(gw2)

const user1 = a.user.username('charles').email('charles@email.com');
const user2 = a.user.username('kagiri').email('kagiri@email.com');

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

  describe('findOrCreate joker', () => {
    it('should create joker if it doesnt exist', done => {
      const userId = user1.user?.id!
      const seasonId = epl2022.season?.id!
      const gameRoundId = gw1.gameRound?.id!;
      const matchId = manuVmanc.match?.id!;

      predictionRepo
        .findOrCreateJoker$(
          userId,
          seasonId,
          gameRoundId,
          [matchId],
        )
        .subscribe(p => {
          expect(p).to.have.property('hasJoker', true);
          expect(p).to.have.property('jokerAutoPicked', true);
          done();
        });
    });

    it('should findOne prediction by user and match', done => {
      const userId = user1.user?.id!
      const matchId = manuVmanc.match?.id!
      const { slug: matchSlug, season, gameRound, id } = manuVmanc.match as Required<Match>;
      let prediction: Prediction;
      const predData: Prediction = {
        user: userId,
        match: matchId,
        matchSlug,
        season,
        gameRound,
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

    describe('findOneOrCreate prediction', () => {
      it('should create prediction if it doesnt exist', done => {
        const userId = user1.user?.id!
        const { id: matchId, slug: matchSlug } = manuVmanc.match as Required<Match>;

        predictionRepo
          .findOneOrCreate$({ userId, matchId })
          .subscribe(p => {
            expect(p.user.toString()).to.equal(userId);
            expect(p.match.toString()).to.equal(matchId);
            expect(p.matchSlug).to.equal(matchSlug);
            expect(p).to.have.property('hasJoker', false);
            done();
          });
      });

      it('should return existing prediction', done => {
        let prediction: Prediction;
        const userId = user1.user?.id!
        const matchId = manuVmanc.match?.id!

        predictionRepo
          .findOneOrCreate$({ userId, matchId })
          .pipe(
            flatMap(p => {
              prediction = p;
              return predictionRepo.findOneOrCreate$({ userId, matchId });
            })
          )
          .subscribe(p => {
            // not sure why I need to do a deep object comparison here; leads to unnecessary casting
            expect((p as PredictionDocument).toObject()).to.eql(
              (prediction as PredictionDocument).toObject(),
            );
            done();
          });
      });

      it('should findById And update score', done => {
        let scorePoints: ScorePoints;
        const userId = user1.user?.id!
        const matchId = manuVmanc.match?.id!

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
    });
  });
});
