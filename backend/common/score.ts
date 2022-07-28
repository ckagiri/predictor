export interface Score {
  goalsHomeTeam: number;
  goalsAwayTeam: number;
  isComputerGenerated?: boolean;
}

export interface ScorePoints {
  correctMatchOutcomePoints: number;
  exactGoalDifferencePoints: number;
  closeMatchScorePoints: number;
  exactTeamScorePoints: number;
  exactMatchScorePoints: number;
}

export interface Odds {
  homeWin: number;
  awayWin: number;
  draw: number;
}
