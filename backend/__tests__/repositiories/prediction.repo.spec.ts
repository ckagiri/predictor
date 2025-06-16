import { expect } from 'chai';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { Match, Prediction } from '../../db/models';
import { MatchStatus } from '../../db/models/match.model';
import { PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import a from '../a';
import memoryDb from '../memoryDb';

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
  });

const manu = a.team
  .setName('Manchester United')
  .setTla('MNU')
  .setSlug('man-utd');
const manc = a.team
  .setName('Manchester City')
  .setTla('MNC')
  .setSlug('man-city');
const che = a.team.setName('Chelsea').setTla('CHE').setSlug('chelsea');
const ars = a.team.setName('Arsenal').setTla('ARS').setSlug('arsenal');
const liv = a.team
  .setName('Liverpool')
  .setTla('LIV')
  .setTla('MNU')
  .setSlug('liverpool');
const tot = a.team.setName('Tottenham').setTla('TOT').setSlug('tottenham');
const eve = a.team.setName('Everton').setTla('EVE').setSlug('everton');
const whu = a.team.setName('West Ham').setTla('WHU').setSlug('west-ham');

const gw1 = a.gameRound
  .setName('Gameweek 1')
  .setSlug('gameweek-1')
  .setPosition(1);
const gw2 = a.gameRound
  .setName('Gameweek 2')
  .setSlug('gameweek-2')
  .setPosition(2);

const manuVmanc = a.match
  .withHomeTeam(manu)
  .withAwayTeam(manc)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .setStatus(MatchStatus.SCHEDULED);

const cheVars = a.match
  .withHomeTeam(che)
  .withAwayTeam(ars)
  .setDate('2021-08-21T11:30:00Z')
  .withGameRound(gw1)
  .setStatus(MatchStatus.SCHEDULED);

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
  .setStatus(MatchStatus.POSTPONED);

const epl2022Matches = [manuVmanc, livVtot, cheVars, eveVwhu];

const user1 = a.user.setUsername('charles');
const user2 = a.user.setUsername('kagiri');

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
          .withMatches(...epl2022Matches)
      )
      .build();
  });

  describe('finders', () => {
    it('findOne should find prediction by user and match', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const { slug: matchSlug } = manuVmanc.match as Required<Match>;
      let prediction: Prediction;
      const predData: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 0,
          isComputerGenerated: true,
        },
        match: matchId,
        matchSlug,
        season: epl2022.id,
        user: userId,
      };
      predictionRepo
        .insert$(predData)
        .pipe(
          mergeMap(p => {
            prediction = p;
            return predictionRepo.findOne$(userId, matchId);
          })
        )
        .subscribe(p => {
          expect(p?.id).to.equal(prediction.id);
          done();
        });
    });

    it('should find by user and match And update', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const matchSlug = manuVmanc.slug;
      const origChoice = {
        goalsAwayTeam: 1,
        goalsHomeTeam: 2,
        isComputerGenerated: true,
      };
      const newChoice = {
        goalsAwayTeam: 2,
        goalsHomeTeam: 1,
        isComputerGenerated: false,
      };

      const userId1matchId1Pred: Prediction = {
        choice: origChoice,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        season: epl2022.id,
        user: userId,
      };

      predictionRepo
        .insert$(userId1matchId1Pred)
        .pipe(
          mergeMap(() => {
            return predictionRepo.findOneAndUpdate$(
              { match: matchId, user: userId },
              { choice: newChoice }
            );
          })
        )
        .subscribe(pred => {
          expect(pred.match.toString()).to.equal(matchId);
          expect(pred.matchSlug).to.equal(matchSlug);
          expect(pred.choice.goalsHomeTeam).to.equal(newChoice.goalsHomeTeam);
          expect(pred.choice.goalsAwayTeam).to.equal(newChoice.goalsAwayTeam);
          expect(pred.choice.isComputerGenerated).to.be.false;
          done();
        });
    });

    it('should be null if it cant find by user and match to update', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const choice = { goalsAwayTeam: 1, goalsHomeTeam: 2 };

      predictionRepo
        .findOneAndUpdate$({ match: matchId, user: userId }, { choice })
        .subscribe({
          complete: () => {
            done();
          },
          error: err => {
            // rethrow error - this in not expected
            throw err;
          },
          next: pred => {
            expect(pred).to.be.null;
          },
        });
    });

    it('should find by user and match And update if it exists (update variation)', done => {
      const userId = user1.id;
      const matchId = manuVmanc.id;
      const matchSlug = manuVmanc.slug;
      const origChoice = {
        goalsAwayTeam: 1,
        goalsHomeTeam: 2,
        isComputerGenerated: true,
      };
      const newChoice = {
        goalsAwayTeam: 2,
        goalsHomeTeam: 1,
        isComputerGenerated: false,
      };

      const userId1matchId1Pred: Prediction = {
        choice: origChoice,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        season: epl2022.id,
        user: userId,
      };

      predictionRepo
        .insert$(userId1matchId1Pred)
        .pipe(
          mergeMap(() => {
            return predictionRepo.findOneAndUpdate$(
              { match: matchId, user: userId },
              { choice: newChoice }
            );
          })
        )
        .subscribe(pred => {
          expect(pred.match.toString()).to.equal(matchId);
          expect(pred.matchSlug).to.equal(matchSlug);
          expect(pred.choice.goalsHomeTeam).to.equal(newChoice.goalsHomeTeam);
          expect(pred.choice.goalsAwayTeam).to.equal(newChoice.goalsAwayTeam);
          expect(pred.choice.isComputerGenerated).to.be.false;
          done();
        });
    });

    describe('findOrCreateJoker', () => {
      it('should find joker if it exists', done => {
        const userId = user1.id;
        const roundMatches = epl2022Matches
          .filter(m => m.gameRound.id === gw1.id)
          .map(m => m.match!);

        const userId1matchId1Pred: Prediction = {
          choice: {
            goalsAwayTeam: 0,
            goalsHomeTeam: 0,
            isComputerGenerated: true,
          },
          hasJoker: true,
          jokerAutoPicked: true,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          season: epl2022.id,
          user: userId,
        };

        predictionRepo
          .insertMany$([userId1matchId1Pred])
          .pipe(
            mergeMap(() =>
              predictionRepo.findOrCreateJoker$(userId, roundMatches)
            )
          )
          .subscribe(p => {
            expect(p).to.have.property('hasJoker', true);
            expect(p).to.have.property('jokerAutoPicked', true);
            done();
          });
      });

      it('should create joker if it doesnt exist', done => {
        const userId = user1.id;
        const roundMatches = epl2022Matches
          .filter(m => m.gameRound.id === gw1.id)
          .map(m => m.match!);

        const userId1matchId1Pred: Prediction = {
          choice: {
            goalsAwayTeam: 0,
            goalsHomeTeam: 0,
            isComputerGenerated: true,
          },
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          season: epl2022.id,
          user: userId,
        };

        predictionRepo
          .insertMany$([userId1matchId1Pred])
          .pipe(
            mergeMap(() =>
              predictionRepo.findOrCreateJoker$(userId, roundMatches)
            )
          )
          .subscribe(p => {
            expect(p).to.have.property('hasJoker', true);
            expect(p).to.have.property('jokerAutoPicked', true);
            done();
          });
      });

      it('should pick one joker and unset others if multiple jokers exists', done => {
        const userId = user1.id;
        const roundMatches = epl2022Matches
          .filter(m => m.gameRound.id === gw1.id)
          .map(m => m.match!);

        const userId1matchId1Pred: Prediction = {
          choice: {
            goalsAwayTeam: 0,
            goalsHomeTeam: 0,
            isComputerGenerated: true,
          },
          hasJoker: true,
          jokerAutoPicked: true,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          season: epl2022.id,
          user: userId,
        };
        const userId1matchId2Pred: Prediction = {
          choice: {
            goalsAwayTeam: 0,
            goalsHomeTeam: 1,
            isComputerGenerated: true,
          },
          hasJoker: true,
          jokerAutoPicked: true,
          match: cheVars.id,
          matchSlug: cheVars.slug,
          season: epl2022.id,
          user: userId,
        };

        predictionRepo
          .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
          .pipe(
            mergeMap(() =>
              predictionRepo.findOrCreateJoker$(userId, roundMatches)
            )
          )
          .pipe(
            mergeMap(() =>
              predictionRepo.findAll$({
                hasJoker: true,
                match: { $in: [manuVmanc.id, cheVars.id] },
                user: userId,
              })
            )
          )
          .subscribe(predictions => {
            expect(predictions.filter(p => p.hasJoker)).to.have.lengthOf(1);
            done();
          });
      });
    });

    it('should find Predictions', done => {
      const userId1 = user1.id;
      const roundMatches = epl2022Matches
        .filter(m => m.gameRound.id === gw1.id)
        .map(m => m.match!);

      const userId1matchId1Pred: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 0,
          isComputerGenerated: true,
        },
        hasJoker: true,
        jokerAutoPicked: false,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        season: epl2022.id,
        user: userId1,
      };
      const userId1matchId2Pred: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 1,
          isComputerGenerated: false,
        },
        hasJoker: false,
        jokerAutoPicked: false,
        match: cheVars.id,
        matchSlug: cheVars.slug,
        season: epl2022.id,
        user: userId1,
      };
      const userId1matchId3Pred: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 2,
          isComputerGenerated: false,
        },
        hasJoker: false,
        jokerAutoPicked: false,
        match: livVtot.id,
        matchSlug: livVtot.slug,
        season: epl2022.id,
        user: userId1,
      };

      predictionRepo
        .insertMany$([
          userId1matchId1Pred,
          userId1matchId2Pred,
          userId1matchId3Pred,
        ])
        .pipe(
          mergeMap(() =>
            predictionRepo.findOrCreatePredictions$(userId1, roundMatches)
          )
        )
        .subscribe(preds => {
          expect(preds).to.have.length(3);
          expect(preds.filter(p => p.hasJoker)).to.have.length(1);
          done();
        });
    });

    it('should findOrCreatePredictions', done => {
      const userId1 = user1.id;
      const roundMatches = epl2022Matches
        .filter(m => m.gameRound.id === gw1.id)
        .map(m => m.match!);

      const userId1matchId1Pred: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 1,
          isComputerGenerated: true,
        },
        hasJoker: true,
        jokerAutoPicked: true,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        season: epl2022.id,
        user: userId1,
      };
      const userId1matchId2Pred: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 2,
          isComputerGenerated: false,
        },
        hasJoker: true,
        jokerAutoPicked: false,
        match: cheVars.id,
        matchSlug: cheVars.slug,
        season: epl2022.id,
        user: userId1,
      };

      predictionRepo
        .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
        .pipe(
          mergeMap(() =>
            predictionRepo.findOrCreatePredictions$(userId1, roundMatches)
          )
        )
        .subscribe(preds => {
          expect(preds).to.have.length(2);
          expect(preds.filter(p => p.hasJoker)).to.have.length(1);
          done();
        });
    });

    describe('pick joker', () => {
      it('should pick a different joker if joker exists', done => {
        const userId1matchId1Pred: Prediction = {
          choice: { goalsAwayTeam: 0, goalsHomeTeam: 0 },
          hasJoker: true,
          jokerAutoPicked: true,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          season: epl2022.id,
          user: user1.id,
        };
        const userId1matchId2Pred: Prediction = {
          choice: { goalsAwayTeam: 0, goalsHomeTeam: 1 },
          match: cheVars.id,
          matchSlug: cheVars.slug,
          season: epl2022.id,
          user: user1.id,
        };
        const roundMatches = epl2022Matches
          .filter(m => m.gameRound.id === gw1.id)
          .map(m => m.match!);

        predictionRepo
          .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
          .pipe(
            mergeMap(() => {
              return predictionRepo.pickJoker$(
                user1.id,
                cheVars.match!,
                roundMatches
              );
            })
          )
          .subscribe(predictions => {
            expect(predictions).to.have.lengthOf(2);
            const oldJoker = predictions.find(
              p => p.match.toString() === manuVmanc.id
            );
            expect(oldJoker?.hasJoker).to.be.false;
            const newJoker = predictions.find(
              p => p.match.toString() === cheVars.id
            );
            expect(newJoker?.hasJoker).to.be.true;
            expect(newJoker?.jokerAutoPicked).to.be.false;
            done();
          });
      });

      it('should pick same joker if it is same match', done => {
        const userId1matchId1Pred: Prediction = {
          choice: { goalsAwayTeam: 0, goalsHomeTeam: 0 },
          hasJoker: true,
          jokerAutoPicked: true,
          match: manuVmanc.id,
          matchSlug: manuVmanc.slug,
          season: epl2022.id,
          user: user1.id,
        };
        const userId1matchId2Pred: Prediction = {
          choice: { goalsAwayTeam: 0, goalsHomeTeam: 1 },
          match: cheVars.id,
          matchSlug: cheVars.slug,
          season: epl2022.id,
          user: user1.id,
        };
        const roundMatches = epl2022Matches
          .filter(m => m.gameRound.id === gw1.id)
          .map(m => m.match!);

        predictionRepo
          .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
          .pipe(
            mergeMap(() => {
              return predictionRepo.pickJoker$(
                user1.id,
                manuVmanc.match!,
                roundMatches
              );
            })
          )
          .subscribe(predictions => {
            expect(predictions).to.have.lengthOf(1);
            const joker = predictions.find(
              p => p.match.toString() === manuVmanc.id
            );
            expect(joker?.hasJoker).to.be.true;
            expect(joker?.jokerAutoPicked).to.be.false;
            done();
          });
      });
    });

    it('should findOrCreatePicks ', done => {
      const userId1 = user1.id;

      const userId1matchId1Pred: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 0,
          isComputerGenerated: true,
        },
        hasJoker: true,
        jokerAutoPicked: true,
        match: manuVmanc.id,
        matchSlug: manuVmanc.slug,
        season: epl2022.id,
        user: userId1,
      };
      const userId1matchId2Pred: Prediction = {
        choice: {
          goalsAwayTeam: 0,
          goalsHomeTeam: 1,
          isComputerGenerated: true,
        },
        hasJoker: false,
        jokerAutoPicked: false,
        match: cheVars.id,
        matchSlug: cheVars.slug,
        season: epl2022.id,
        user: userId1,
      };
      const roundMatches = epl2022Matches
        .filter(m => m.gameRound.id === gw1.id)
        .map(m => m.match!);

      predictionRepo
        .insertMany$([userId1matchId1Pred, userId1matchId2Pred])
        .pipe(
          mergeMap(() =>
            predictionRepo.findOrCreatePicks$(userId1, roundMatches)
          )
        )
        .subscribe(preds => {
          expect(preds).to.have.length(2);
          expect(preds.filter(p => p.hasJoker)).to.have.length(1);
          expect(preds.find(p => p.hasJoker)?.match.toString()).to.equal(
            manuVmanc.id
          );
          expect(preds.filter(p => p.choice.isComputerGenerated)).to.be.empty;
          done();
        });
    });
  });
});
