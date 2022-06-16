export interface Score {
  goalsHomeTeam: number;
  goalsAwayTeam: number;
  isComputerGenerated?: boolean;
}

export interface ScorePoints {
  points: number;
  resultPoints: number;
  scorePoints: number;
  correctMatchOutcomePoints: number;
  exactGoalDifferencePoints: number;
  closeMatchScorePoints: number;
  exactTeamScorePoints: number;
  exactMatchScorePoints: number;
  [key: string]: number;
}

export interface Odds {
  homeWin: number;
  awayWin: number;
  draw: number;
}
