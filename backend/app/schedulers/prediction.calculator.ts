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
    const choiceOutcome = outcome(
      choice.goalsHomeTeam,
      choice.goalsAwayTeam,
    );
    const resultOutcome = outcome(
      result.goalsHomeTeam,
      result.goalsAwayTeam,
    );

    const correctMatchOutcome = choiceOutcome === resultOutcome;
    const drawPrediction = choice.goalsHomeTeam === choice.goalsAwayTeam;
    const correctDrawOutcome = correctMatchOutcome && drawPrediction;
    const correctWinnerOutcome = correctMatchOutcome && !drawPrediction;
    const exactGoalDiff = goalDiff(choice) === goalDiff(result);
    const exactTotalGoals = totalGoals(choice) === totalGoals(result);
    const oneGoalOff = goalsOff(choice, result) === 1;
    const twoGoalsOff = goalsOff(choice, result) === 2;

    if (correctMatchOutcome) {
      points.correctMatchOutcomePoints = 7;
    }
    if (exactGoalDiff) {
      points.exactGoalDifferencePoints = 1;
    }

    if ((correctWinnerOutcome && oneGoalOff) || (correctDrawOutcome && twoGoalsOff)) {
      points.closeMatchScorePoints = 2;
    }

    if (
      (correctWinnerOutcome && exactGoalDiff && twoGoalsOff) ||
      (correctWinnerOutcome && exactTotalGoals && twoGoalsOff) ||
      (!correctMatchOutcome && oneGoalOff)
    ) {
      points.closeMatchScorePoints = 1;
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
      points.exactMatchScorePoints = 10;
    }


    return points;
  }
}

export default PredictionCalculator;

function outcome(home: number, away: number): string {
  if (home > away) {
    return 'w';
  } else if (home < away) {
    return 'l';
  } else {
    return 'd';
  }
}

function goalDiff(score: Score): number {
  return score.goalsHomeTeam - score.goalsAwayTeam;
}

function goalsOff(choice: Score, result: Score): number {
  return Math.abs(choice.goalsHomeTeam - result.goalsHomeTeam) +
    Math.abs(choice.goalsAwayTeam - result.goalsAwayTeam);
}

function totalGoals(score: Score): number {
  return score.goalsHomeTeam + score.goalsAwayTeam;
}
