import { ScorePoints, Score } from '../../common/score';

export class PredictionCalculator {
  public static getInstance() {
    return new PredictionCalculator();
  }

  public calculateScore(result: Score, choice: Score): ScorePoints {
    const scorePoints: ScorePoints = {
      points: 0,
      resultPoints: 0,
      scorePoints: 0,
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
      scorePoints.correctMatchOutcomePoints = 7;
      scorePoints.resultPoints += 7;
    }

    const choiceGd = choice.goalsHomeTeam - choice.goalsAwayTeam;
    const resultGd = result.goalsHomeTeam - result.goalsAwayTeam;
    if (choiceGd === resultGd) {
      scorePoints.exactGoalDifferencePoints = 1;
      scorePoints.resultPoints += 1;
    }

    const homeGoalsGd = Math.abs(choice.goalsHomeTeam - result.goalsHomeTeam);
    const awayGoalsGd = Math.abs(choice.goalsAwayTeam - result.goalsAwayTeam);
    if (homeGoalsGd === 0 || awayGoalsGd === 0) {
      if (homeGoalsGd === 1 || awayGoalsGd === 1) {
        scorePoints.closeMatchScorePoints = 1;
        scorePoints.scorePoints += 1;
      }
    }

    if (choice.goalsHomeTeam === result.goalsHomeTeam) {
      scorePoints.exactTeamScorePoints += 1;
      scorePoints.scorePoints += 1;
    }

    if (choice.goalsAwayTeam === result.goalsAwayTeam) {
      scorePoints.exactTeamScorePoints += 1;
      scorePoints.scorePoints += 1;
    }

    if (
      choice.goalsHomeTeam === result.goalsHomeTeam &&
      choice.goalsAwayTeam === result.goalsAwayTeam
    ) {
      scorePoints.exactMatchScorePoints = 6;
      scorePoints.scorePoints += 6;
    }


    scorePoints.points = scorePoints.resultPoints + scorePoints.scorePoints;
    return scorePoints;
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
