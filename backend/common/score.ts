export interface Odds {
  awayWin: number;
  draw: number;
  homeWin: number;
}

export interface Score {
  goalsAwayTeam: number;
  goalsHomeTeam: number;
  isComputerGenerated?: boolean;
}

export interface ScorePoints {
  closeMatchScorePoints: number;
  correctMatchOutcomePoints: number;
  exactGoalDifferencePoints: number;
  exactMatchScorePoints: number;
  exactTeamScorePoints: number;
}
