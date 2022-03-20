import { expect } from 'chai';

import { PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import { Match, Prediction, PredictionDocument } from '../../db/models';
import { ScorePoints, Score } from '../../common/score';
import a from '../a';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import memoryDb from '../memoryDb';
import { flatMap } from 'rxjs/operators';
import { MatchStatus } from '../../db/models/match.model';

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
const liv = a.team.setName('Liverpool').setSlug('liverpool');
const tot = a.team.setName('Tottenham').setSlug('tottenham');
const eve = a.team.setName('Everton').setSlug('everton');
const whu = a.team.setName('West Ham').setSlug('west-ham')

const gw1 = a.gameRound.setName('Gameweek 1').setPosition(1);
const gw2 = a.gameRound.setName('Gameweek 2').setPosition(2);

const manuVmanc = a.match
  .withHomeTeam(manu)
  .withAwayTeam(manc)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .setStatus(MatchStatus.SCHEDULED)

const cheVars = a.match
  .withHomeTeam(che)
  .withAwayTeam(ars)
  .setDate('2021-08-21T11:30:00Z')
  .withGameRound(gw1)
  .setStatus(MatchStatus.SCHEDULED)

const livVtot = a.match
  .withHomeTeam(liv)
  .withAwayTeam(tot)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .setStatus(MatchStatus.FINISHED);

const eveVwhu = a.match
  .withHomeTeam(eve)
  .withAwayTeam(tot)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw2)
  .setStatus(MatchStatus.POSTPONED)

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
      .withTeams(manu, manc, che, ars, liv, tot, eve, whu)
      .withUsers(user1, user2)
      .withCompetitions(epl)
      .withSeasons(
        epl2022
          .withTeams(manu, manc, che, ars, liv, tot, eve, whu)
          .withGameRounds(gw1, gw2)
          .withMatches(manuVmanc, livVtot, cheVars, eveVwhu)
      )
      .build();
  })

  describe('finders', () => {
    it('findOneOrCreate should create prediction if it doesnt exist', done => {
      const userId = user1.id;
      const { id: matchId, slug: matchSlug } = manuVmanc.match as Required<Match>;

      predictionRepo
        .findOneOrCreate$(userId, matchId)
        .subscribe(p => {
          expect(p.user.toString()).to.equal(userId);
          expect(p.match.toString()).to.equal(matchId);
          expect(p.matchSlug).to.equal(matchSlug);
          expect(p).to.have.property('hasJoker', false);
          done();
        });
    });

    it('findOneOrCreate should return existing prediction', done => {
      let prediction: Prediction;
      const userId = user1.id;
      const matchId = manuVmanc.id;

      predictionRepo
        .findOneOrCreate$(userId, matchId)
        .pipe(
          flatMap(p => {
            prediction = p;
            return predictionRepo.findOneOrCreate$(userId, matchId);
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

    it('findOne should find prediction by user and match', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const { slug: matchSlug } = manuVmanc.match as Required<Match>;
      let prediction: Prediction;
      const predData: Prediction = {
        user: userId,
        match: matchId,
        matchSlug,
        choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
      };
      predictionRepo.insert$(predData)
        .pipe(
          flatMap(p => {
            prediction = p;
            return predictionRepo.findOne$(userId, matchId)
          })
        )
        .subscribe(p => {
          expect(p.id).to.equal(prediction.id);
          done();
        });
    });

    it('should findById And update score-points', done => {
      let scorePoints: ScorePoints;
      const userId = user1.id;
      const matchId = manuVmanc.id;

      predictionRepo
        .findOneOrCreate$(userId, matchId)
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

    it('should find by user and match And insert if it doesnt exist', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const matchSlug = manuVmanc.slug;
      const choice = { goalsHomeTeam: 2, goalsAwayTeam: 1 }

      predictionRepo.findOneAndUpsert$(userId, matchId, choice)
        .pipe(
          flatMap(() => {
            return predictionRepo.findOne$(userId, matchId);
          }),
        )
        .subscribe(pred => {
          expect(pred.match.toString()).to.equal(matchId);
          expect(pred.matchSlug).to.equal(matchSlug);
          expect(pred.choice.goalsHomeTeam).to.equal(choice.goalsHomeTeam);
          expect(pred.choice.goalsHomeTeam).to.equal(choice.goalsHomeTeam);
          expect(pred.choice.isComputerGenerated).to.be.true
          done();
        });
    });

    it('should find by user and match And update if it exists (upsert variation)', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const matchSlug = manuVmanc.slug;
      const origChoice = { goalsHomeTeam: 2, goalsAwayTeam: 1, isComputerGenerated: true }
      const newChoice = { goalsHomeTeam: 1, goalsAwayTeam: 2, isComputerGenerated: false };

      const userId1matchId1Pred: Prediction = {
        user: userId,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        choice: origChoice,
      };

      predictionRepo
        .insert$(userId1matchId1Pred)
        .pipe(
          flatMap(() => {
            return predictionRepo.findOneAndUpsert$(userId, matchId, newChoice);
          }),
        )
        .subscribe(pred => {
          expect(pred.match.toString()).to.equal(matchId);
          expect(pred.matchSlug).to.equal(matchSlug);
          expect(pred.choice.goalsHomeTeam).to.equal(newChoice.goalsHomeTeam);
          expect(pred.choice.goalsAwayTeam).to.equal(newChoice.goalsAwayTeam);
          expect(pred.choice.isComputerGenerated).to.be.false
          done();
        });
    });

    it('should find by user and match And update if it exists (update variation)', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const matchSlug = manuVmanc.slug;
      const origChoice = { goalsHomeTeam: 2, goalsAwayTeam: 1, isComputerGenerated: true }
      const newChoice = { goalsHomeTeam: 1, goalsAwayTeam: 2, isComputerGenerated: false };

      const userId1matchId1Pred: Prediction = {
        user: userId,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        choice: origChoice,
      };

      predictionRepo
        .insert$(userId1matchId1Pred)
        .pipe(
          flatMap(() => {
            return predictionRepo.findOneAndUpdate$(userId, matchId, newChoice);
          }),
        )
        .subscribe(pred => {
          expect(pred.match.toString()).to.equal(matchId);
          expect(pred.matchSlug).to.equal(matchSlug);
          expect(pred.choice.goalsHomeTeam).to.equal(newChoice.goalsHomeTeam);
          expect(pred.choice.goalsAwayTeam).to.equal(newChoice.goalsAwayTeam);
          expect(pred.choice.isComputerGenerated).to.be.false
          done();
        });
    });

    describe('findOrCreateJoker', () => {
      it('should find joker if it exists', done => {
        const userId = user1.id;
        const roundId = gw1.id;

        const userId1matchId1Pred: Prediction = {
          user: userId,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
          hasJoker: true,
          jokerAutoPicked: true,
        };

        predictionRepo
          .insertMany$([userId1matchId1Pred])
          .pipe(
            flatMap(() => predictionRepo.findOrCreateJoker$(userId, roundId))
          )
          .subscribe(p => {
            expect(p).to.have.property('hasJoker', true);
            expect(p).to.have.property('jokerAutoPicked', true);
            done();
          });
      });

      it('should create joker if it doesnt exist', done => {
        const userId = user1.id;
        const roundId = gw1.id;

        const userId1matchId1Pred: Prediction = {
          user: userId,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
        };

        predictionRepo
          .insertMany$([userId1matchId1Pred])
          .pipe(
            flatMap(() => predictionRepo.findOrCreateJoker$(userId, roundId))
          )
          .subscribe(p => {
            expect(p).to.have.property('hasJoker', true);
            expect(p).to.have.property('jokerAutoPicked', true);
            done();
          });
      });

      it('should pick one joker and unset others if multiple jokers exists', done => {
        const userId = user1.id;
        const roundId = gw1.id;

        const userId1matchId1Pred: Prediction = {
          user: userId,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
          hasJoker: true,
          jokerAutoPicked: true,
        };

        const userId1matchId2Pred: Prediction = {
          user: userId,
          match: cheVars.id,
          matchSlug: cheVars.slug,
          choice: { goalsHomeTeam: 1, goalsAwayTeam: 0, isComputerGenerated: true },
          hasJoker: true,
          jokerAutoPicked: true,
        };

        predictionRepo
          .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
          .pipe(
            flatMap(() => predictionRepo.findOrCreateJoker$(userId, roundId))
          ).pipe(
            flatMap(() => predictionRepo.findAll$({
              user: userId,
              match: { $in: [manuVmanc.id, cheVars.id] },
              hasJoker: true
            }))
          )
          .subscribe(predictions => {
            expect(predictions.filter(p => p.hasJoker)).to.have.lengthOf(1);
            done();
          });
      });
    });

    it('should find Predictions', done => {
      const userId1 = user1.id;
      const roundId1 = gw1.id;

      const userId1matchId1Pred: Prediction = {
        user: userId1,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        hasJoker: true,
        jokerAutoPicked: false,
        choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
      };

      const userId1matchId2Pred: Prediction = {
        user: userId1,
        match: cheVars.id,
        matchSlug: cheVars.slug,
        hasJoker: false,
        jokerAutoPicked: false,
        choice: { goalsHomeTeam: 1, goalsAwayTeam: 0, isComputerGenerated: false },
      };

      const userId1matchId3Pred: Prediction = {
        user: userId1,
        match: livVtot.id,
        matchSlug: livVtot.slug,
        hasJoker: false,
        jokerAutoPicked: false,
        choice: { goalsHomeTeam: 2, goalsAwayTeam: 0, isComputerGenerated: false },
      };

      predictionRepo
        .insertMany$([userId1matchId1Pred, userId1matchId2Pred, userId1matchId3Pred])
        .pipe(
          flatMap(() => predictionRepo.findOrCreatePredictions$(userId1, roundId1))
        )
        .subscribe(preds => {
          expect(preds).to.have.length(3)
          expect(preds.filter(p => p.hasJoker)).to.have.length(1);
          done();
        });
    })

    it('should findOrCreatePredictions', done => {
      const userId1 = user1.id;
      const roundId1 = gw1.id;

      const userId1matchId1Pred: Prediction = {
        user: userId1,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        hasJoker: true,
        jokerAutoPicked: true,
        choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
      };

      const userId1matchId2Pred: Prediction = {
        user: userId1,
        match: cheVars.id,
        matchSlug: cheVars.slug,
        hasJoker: true,
        jokerAutoPicked: false,
        choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: false },
      };

      predictionRepo
        .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
        .pipe(
          flatMap(() => predictionRepo.findOrCreatePredictions$(userId1, roundId1))
        )
        .subscribe(preds => {
          expect(preds).to.have.length(3)
          expect(preds.filter(p => p.hasJoker)).to.have.length(1);
          done();
        });
    })

    it('should unset joker', done => {
      const userId1matchId1Pred: Prediction = {
        user: user1.id,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        hasJoker: true,
        jokerAutoPicked: true,
        choice: { goalsHomeTeam: 0, goalsAwayTeam: 0 },
      };
      predictionRepo.insert$(userId1matchId1Pred)
        .pipe(
          flatMap(() => {
            return predictionRepo.unsetJoker$(user1.id, manuVmanc.id)
          })
        ).subscribe(pred => {
          expect(pred.hasJoker).to.be.false
          done();
        })
    });

    describe('pick joker', () => {
      it('should pick a different joker if joker exists', done => {
        const userId1matchId1Pred: Prediction = {
          user: user1.id,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          choice: { goalsHomeTeam: 0, goalsAwayTeam: 0 },
          hasJoker: true,
          jokerAutoPicked: true,
        };
        const userId1matchId2Pred: Prediction = {
          user: user1.id,
          match: cheVars.id,
          matchSlug: cheVars.slug,
          choice: { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        };

        predictionRepo.insertMany$([userId1matchId1Pred, userId1matchId2Pred])
          .pipe(
            flatMap(() => {
              return predictionRepo.pickJoker$(user1.id, cheVars.id)
            })
          ).subscribe(predictions => {
            expect(predictions).to.have.lengthOf(2)
            const oldJoker = predictions.find(p => p.match.toString() === manuVmanc.id)
            expect(oldJoker?.hasJoker).to.be.false;
            const newJoker = predictions.find(p => p.match.toString() === cheVars.id)
            expect(newJoker?.hasJoker).to.be.true;
            expect(newJoker?.jokerAutoPicked).to.be.false;
            done();
          })
      })

      it('should pick same joker if it is same match', done => {
        const userId1matchId1Pred: Prediction = {
          user: user1.id,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          choice: { goalsHomeTeam: 0, goalsAwayTeam: 0 },
          hasJoker: true,
          jokerAutoPicked: true,
        };
        const userId1matchId2Pred: Prediction = {
          user: user1.id,
          match: cheVars.id,
          matchSlug: cheVars.slug,
          choice: { goalsHomeTeam: 1, goalsAwayTeam: 0 },
        };

        predictionRepo.insertMany$([userId1matchId1Pred, userId1matchId2Pred])
          .pipe(
            flatMap(() => {
              return predictionRepo.pickJoker$(user1.id, manuVmanc.id)
            })
          ).subscribe(predictions => {
            expect(predictions).to.have.lengthOf(1)
            const joker = predictions.find(p => p.match.toString() === manuVmanc.id)
            expect(joker?.hasJoker).to.be.true;
            expect(joker?.jokerAutoPicked).to.be.false;
            done();
          })
      })
    })

    it('should findOrCreatePicks ', done => {
      const userId1 = user1.id;
      const roundId1 = gw1.id;

      const userId1matchId1Pred: Prediction = {
        user: userId1,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        hasJoker: true,
        jokerAutoPicked: true,
        choice: { goalsHomeTeam: 0, goalsAwayTeam: 0, isComputerGenerated: true },
      };

      const userId1matchId2Pred: Prediction = {
        user: userId1,
        match: cheVars.id,
        matchSlug: cheVars.slug,
        hasJoker: false,
        jokerAutoPicked: false,
        choice: { goalsHomeTeam: 1, goalsAwayTeam: 0, isComputerGenerated: true },
      };

      predictionRepo
        .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
        .pipe(
          flatMap(() => predictionRepo.findOrCreatePicks$(userId1, roundId1))
        )
        .subscribe(preds => {
          expect(preds).to.have.length(3)
          expect(preds.filter(p => p.hasJoker)).to.have.length(1);
          expect(preds.some(p => p.choice.isComputerGenerated)).to.be.false
          done();
        });
    })
  });
});
