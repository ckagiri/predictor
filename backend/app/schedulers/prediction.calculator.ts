import { ScorePoints, Score } from '../../common/score';

export class PredictionCalculator {
  public static getInstance() {
    return new PredictionCalculator();
  }

  public calculateScore(result: Score, choice: Score): ScorePoints {
    const points: ScorePoints = {
      correctMatchOutcomePoints: 0,
      exactGoalDifferencePoints: 0,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
    };
    const choiceOutcome = calcOutcome(
      choice.goalsHomeTeam,
      choice.goalsAwayTeam,
    );
    const resultOutcome = calcOutcome(
      result.goalsHomeTeam,
      result.goalsAwayTeam,
    );
    if (choiceOutcome === resultOutcome) {
      points.correctMatchOutcomePoints = 7;
    }

    const choiceGd = choice.goalsHomeTeam - choice.goalsAwayTeam;
    const resultGd = result.goalsHomeTeam - result.goalsAwayTeam;
    if (choiceGd === resultGd) {
      points.exactGoalDifferencePoints = 1;
    }

    const homeGoalsGd = Math.abs(choice.goalsHomeTeam - result.goalsHomeTeam);
    const awayGoalsGd = Math.abs(choice.goalsAwayTeam - result.goalsAwayTeam);
    if (homeGoalsGd === 0 || awayGoalsGd === 0) {
      if (homeGoalsGd === 1 || awayGoalsGd === 1) {
        points.closeMatchScorePoints = 1;
      }
    }

    if (choice.goalsHomeTeam === result.goalsHomeTeam) {
      points.exactTeamScorePoints += 1;
    }

    if (choice.goalsAwayTeam === result.goalsAwayTeam) {
      points.exactTeamScorePoints += 1;
    }

    if (
      choice.goalsHomeTeam === result.goalsHomeTeam &&
      choice.goalsAwayTeam === result.goalsAwayTeam
    ) {
      points.exactMatchScorePoints = 6;
    }


    return points;
  }
}

export default PredictionCalculator;

function calcOutcome(home: number, away: number): string {
  if (home > away) {
    return 'w';
  } else if (home < away) {
    return 'l';
  } else {
    return 'd';
  }
}
