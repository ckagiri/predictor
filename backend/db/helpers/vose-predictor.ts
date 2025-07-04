import { Odds } from '../../common/score.js';
import { Vose } from './vose.js';

export class VosePredictor {
  awayWinOdds: number;
  drawOdds: number;
  drawVose: any;

  favoriteVose: any;
  homeWinOdds: number;
  underdogVose: any;

  constructor(odds?: Odds) {
    odds ??= { awayWin: 1, draw: 1, homeWin: 1 };
    const { awayWin, draw, homeWin } = odds;
    this.homeWinOdds = homeWin;
    this.awayWinOdds = awayWin;
    this.drawOdds = draw;
  }

  predict() {
    const homeWinWeight = Math.round((1 / this.homeWinOdds) * 100);
    const drawWeight = Math.round((1 / this.drawOdds) * 100);
    const awayWinWeight = Math.round((1 / this.awayWinOdds) * 100);
    const v = new Vose([homeWinWeight, drawWeight, awayWinWeight]);
    const outcomes: string[] = ['HOME', 'DRAW', 'AWAY'];
    const outcome = outcomes[v.next()];
    let score = '0-0';
    if (outcome === 'HOME') {
      score = this.getHomePredictionScore();
    } else if (outcome === 'AWAY') {
      score = this.getAwayPredictionScore();
    } else if (outcome === 'DRAW') {
      score = this.getDrawPredictionScore();
    }
    return score;
  }

  private getAwayPredictionScore() {
    const scoreToWeight = {
      '0-1': 28,
      '0-2': 18,
      '0-3': 13,
      '0-4': 7,
      '1-2': 25,
      '1-3': 8,
      '1-4': 7,
      '2-3': 12,
      '2-4': 3,
    };
    return this.getScore(scoreToWeight);
  }

  private getDrawPredictionScore() {
    const scoreToWeight = {
      '0-0': 22,
      '1-1': 42,
      '2-2': 20,
      '3-3': 4,
    };
    return this.getScore(scoreToWeight);
  }

  // weigths from https://fcstats.com/statistics,premier-league-england,1,5,3374.php
  private getHomePredictionScore() {
    const scoreToWeight = {
      '1-0': 37,
      '2-0': 28,
      '2-1': 25,
      '3-0': 18,
      '3-1': 18,
      '3-2': 10,
      '4-0': 7,
      '4-1': 6,
      '4-2': 2,
    };
    return this.getScore(scoreToWeight);
  }

  private getScore(scoreToWeight: Record<string, number>) {
    const weights = Object.values(scoreToWeight);
    const scores = Object.keys(scoreToWeight);
    const vose = new Vose(weights);
    return scores[vose.next()];
  }
}
