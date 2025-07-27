import { Odds } from '../../common/score.js';
import { Vose } from './vose.js';

/**
 * VosePredictor uses the Vose alias method to predict match outcomes based on betting odds.
 * It generates a score prediction for home, draw, or away outcomes based on the provided odds.
 * The scores are derived from historical data and weighted probabilities.
 *
 */
export class VosePredictor {
  protected vose: Vose;
  protected OUTCOMES: string[] = ['HOME', 'DRAW', 'AWAY'];

  constructor(odds?: Odds) {
    odds ??= { awayWin: 2.88, draw: 4.08, homeWin: 2.45 };
    const { awayWin, draw, homeWin } = odds;
    const homeWinWeight = Math.round((1 / homeWin) * 100);
    const drawWeight = Math.round((1 / draw) * 100);
    const awayWinWeight = Math.round((1 / awayWin) * 100);

    this.vose = new Vose([homeWinWeight, drawWeight, awayWinWeight]);
  }

  static getInstance(odds?: Odds) {
    return new VosePredictor(odds);
  }

  predict() {
    const outcome = this.OUTCOMES[this.vose.next()];
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

  // based on weights from recent season
  // https://fcstats.com/statistics,premier-league-england,1,5,3374.php
  protected getAwayPredictionScore() {
    const scoreToWeight = {
      '0-1': 26,
      '0-2': 28,
      '0-3': 12,
      '0-4': 5,
      '1-2': 29,
      '1-3': 11,
      '1-4': 4,
      '2-3': 5,
      '2-4': 2,
      '3-4': 1,
    };
    return this.getScore(scoreToWeight);
  }

  protected getDrawPredictionScore() {
    const scoreToWeight = {
      '0-0': 16,
      '1-1': 45,
      '2-2': 31,
      '3-3': 1,
    };
    return this.getScore(scoreToWeight);
  }

  protected getHomePredictionScore() {
    const scoreToWeight = {
      '1-0': 29,
      '2-0': 21,
      '2-1': 33,
      '3-0': 11,
      '3-1': 17,
      '3-2': 11,
      '4-0': 7,
      '4-1': 10,
      '4-2': 6,
      '4-3': 3,
    };
    return this.getScore(scoreToWeight);
  }

  protected getScore(scoreToWeight: Record<string, number>) {
    const weights = Object.values(scoreToWeight);
    const scores = Object.keys(scoreToWeight);
    const vose = new Vose(weights);
    return scores[vose.next()];
  }
}

export class DefaultVosePredictor extends VosePredictor {
  static getInstance() {
    return new DefaultVosePredictor({
      awayWin: 2.88,
      draw: 4.08,
      homeWin: 2.45,
    });
  }
  // based on first 125 yrs of top-flight english football
  // https://fivethirtyeight.com/features/in-126-years-english-football-has-seen-13475-nil-nil-draws/
  protected getAwayPredictionScore() {
    const scoreToWeight = {
      '0-1': 63,
      '0-2': 34,
      '0-3': 14,
      '0-4': 4,
      '1-2': 56,
      '1-3': 23,
      '1-4': 7,
      '2-3': 18,
      '2-4': 6,
      '3-4': 3,
    };
    return this.getScore(scoreToWeight);
  }

  protected getDrawPredictionScore() {
    const scoreToWeight = {
      '0-0': 72,
      '1-1': 116,
      '2-2': 52,
      '3-3': 11,
    };
    return this.getScore(scoreToWeight);
  }

  protected getHomePredictionScore() {
    const scoreToWeight = {
      '1-0': 98,
      '2-0': 81,
      '2-1': 89,
      '3-0': 48,
      '3-1': 52,
      '3-2': 28,
      '4-0': 23,
      '4-1': 25,
      '4-2': 14,
      '4-3': 5,
    };
    return this.getScore(scoreToWeight);
  }
}

export const VosePredictorImpl = {
  getDefault: () => DefaultVosePredictor.getInstance(),
  getInstance: (odds?: Odds) => VosePredictor.getInstance(odds),
};
