/**
 * Vose alias method for efficient sampling of weighted distribution
 * Borrowed almost entirely from https://github.com/jdiscar/vose-alias-method.js
 * Fantastic explanation here: http://www.keithschwarz.com/darts-dice-coins/
 */

export class Vose {
  alias: number[];
  probability: number[];
  totalDistinctValues: number;

  constructor(weights: number[]) {
    const large: number[] = [];
    const small: number[] = [];
    let less: number, more: number;

    if (!(weights instanceof Array) || weights.length < 1) {
      throw new Error('Vose: weights must be a non-empty array');
    }

    this.totalDistinctValues = weights.length;
    this.probability = [];
    this.alias = [];
    const average = 1.0 / this.totalDistinctValues;
    weights = normalizeScale(weights.slice(0));

    for (let i = 0; i < this.totalDistinctValues; i++) {
      (weights[i] >= average ? large : small).push(i);
    }

    while (small.length > 0 && large.length > 0) {
      less = small.shift()!;
      more = large.shift()!;

      this.probability[less] = weights[less] * this.totalDistinctValues;
      this.alias[less] = more;

      weights[more] = weights[more] + weights[less] - average;
      (weights[more] >= average ? large : small).push(more);
    }

    while (large.length !== 0) {
      this.probability[large.shift()!] = 1;
    }

    while (small.length !== 0) {
      this.probability[small.shift()!] = 1;
    }
  }

  next = () => {
    const column = getRandomInt(0, this.totalDistinctValues - 1);
    const coinToss = Math.random() < this.probability[column];
    return coinToss ? column : this.alias[column];
  };
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function normalizeScale(weights: number[]) {
  const total = weights.reduce((a, b) => a + b);

  if (total > 1) {
    weights = weights.map(value => value / total);
  } else if (total < 1) {
    weights.push(1 - total);
  }

  return weights;
}
