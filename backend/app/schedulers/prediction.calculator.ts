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

    const choiceOutcome = outcome(choice.goalsHomeTeam, choice.goalsAwayTeam);
    const resultOutcome = outcome(result.goalsHomeTeam, result.goalsAwayTeam);
    const correctMatchOutcome = choiceOutcome === resultOutcome;
    const drawPrediction = choice.goalsHomeTeam === choice.goalsAwayTeam;
    const correctDrawOutcome = correctMatchOutcome && drawPrediction;
    const correctWinnerOutcome = correctMatchOutcome && !drawPrediction;
    const exactGoalDiff = goalDiff(choice) === goalDiff(result);
    const oneGoalOffOverall = goalsOff(choice, result) === 1;
    const oneGoalOffBothTeams = goalsOffHomeTeam(choice, result) === 1 &&
      goalsOffAwayTeam(choice, result) === 1;

    if (correctMatchOutcome) {
      points.correctMatchOutcomePoints = 7;
    }

    if (exactGoalDiff) {
      points.exactGoalDifferencePoints = 1;
    }

    if ((correctDrawOutcome && oneGoalOffBothTeams) ||
      (correctWinnerOutcome && oneGoalOffOverall)) {
      points.closeMatchScorePoints = 2;
    }

    if (
      (correctWinnerOutcome && oneGoalOffBothTeams) ||
      (!correctMatchOutcome && oneGoalOffOverall)
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

function goalsOffHomeTeam(choice: Score, result: Score): number {
  return Math.abs(choice.goalsHomeTeam - result.goalsHomeTeam);
}

function goalsOffAwayTeam(choice: Score, result: Score): number {
  return Math.abs(choice.goalsAwayTeam - result.goalsAwayTeam);
}

function goalsOff(choice: Score, result: Score): number {
  return goalsOffHomeTeam(choice, result) + goalsOffAwayTeam(choice, result);
}
