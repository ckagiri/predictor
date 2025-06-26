import { model, Schema } from 'mongoose';

import { Odds, Score } from '../../common/score.js';
import { Entity, schema } from './base.model.js';
import { Prediction } from './prediction.model.js';

export enum MatchStatus {
  CANCELED = 'CANCELED',
  FINISHED = 'FINISHED',
  LIVE = 'LIVE',
  POSTPONED = 'POSTPONED',
  SCHEDULED = 'SCHEDULED',
}

const MATCH_STATUS: Record<string, MatchStatus> = {
  AWARDED: MatchStatus.FINISHED,
  CANCELLED: MatchStatus.CANCELED,
  FINISHED: MatchStatus.FINISHED,
  IN_PLAY: MatchStatus.LIVE,
  PAUSED: MatchStatus.LIVE,
  POSTPONED: MatchStatus.POSTPONED,
  SCHEDULED: MatchStatus.SCHEDULED,
  SUSPENDED: MatchStatus.CANCELED,
  TIMED: MatchStatus.SCHEDULED,
};
export const getMatchStatus = (status: string) => {
  return Object.prototype.hasOwnProperty.call(MATCH_STATUS, status)
    ? MATCH_STATUS[status]
    : MatchStatus.SCHEDULED;
};

export interface Match extends Entity {
  [key: string]: any;
  allPredictionPointsCalculated?: boolean;
  awayTeam?: TeamPartial;
  awayTeamId?: string;
  externalReference?: any;
  gameRound: string;
  homeTeam?: TeamPartial;
  homeTeamId?: string;
  matchday?: number;
  odds?: Odds;
  prediction?: null | Prediction | undefined;
  result?: Score;
  season: string;
  slug: string;
  status?: MatchStatus;
  utcDate?: string;
  venue?: string;
}

export interface TeamPartial {
  crestUrl: string;
  id: string;
  name: string;
  slug: string;
}

const { Mixed, ObjectId } = Schema.Types;

export const matchSchema = schema({
  allPredictionPointsCalculated: { default: false, type: Boolean },
  awayTeam: {
    crestUrl: { type: String },
    id: { index: true, ref: 'Team', required: true, type: ObjectId },
    name: { required: true, type: String },
    slug: { required: true, type: String },
  },
  externalReference: { type: Mixed },
  gameRound: { index: true, ref: 'GameRound', required: true, type: ObjectId },
  homeTeam: {
    crestUrl: { type: String },
    id: { index: true, ref: 'Team', required: true, type: ObjectId },
    name: { required: true, type: String },
    slug: { required: true, type: String },
  },
  matchday: { type: Number },
  odds: {
    awayWin: { default: 1, type: Number },
    draw: { default: 1, type: Number },
    homeWin: { default: 1, type: Number },
  },
  result: {
    goalsAwayTeam: { type: Number },
    goalsHomeTeam: { type: Number },
  },
  season: { index: true, ref: 'Season', required: true, type: ObjectId },
  slug: { required: true, trim: true, type: String },
  status: {
    enum: ['SCHEDULED', 'LIVE', 'CANCELED', 'POSTPONED', 'FINISHED'],
    required: true,
    type: String,
  },
  utcDate: { required: true, type: Date },
  venue: { trim: true, type: String },
});

const MatchModel = model<Match>('Match', matchSchema);

export default MatchModel;
