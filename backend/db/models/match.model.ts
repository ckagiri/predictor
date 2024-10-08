import { Schema, model } from 'mongoose';

import { Entity, schema } from './base.model';
import { Score, Odds } from '../../common/score';
import { Prediction } from './prediction.model';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  CANCELED = 'CANCELED',
  POSTPONED = 'POSTPONED',
  FINISHED = 'FINISHED',
}

export const getMatchStatus = (status: string) => {
  const MATCH_STATUS: { [key: string]: MatchStatus } = {
    'SCHEDULED': MatchStatus.SCHEDULED,
    'TIMED': MatchStatus.SCHEDULED,
    'IN_PLAY': MatchStatus.LIVE,
    'PAUSED': MatchStatus.LIVE,
    'FINISHED': MatchStatus.FINISHED,
    'AWARDED': MatchStatus.FINISHED,
    'CANCELLED': MatchStatus.CANCELED,
    'SUSPENDED': MatchStatus.CANCELED,
    'POSTPONED': MatchStatus.POSTPONED
  };

  return MATCH_STATUS[status] || MatchStatus.SCHEDULED;
}

export interface TeamPartial {
  name: string;
  slug: string;
  crestUrl: string;
  id: string;
}

export interface Match extends Entity {
  id?: string;
  season: string;
  slug: string;
  utcDate?: string;
  matchday?: number;
  gameRound: string;
  status?: MatchStatus;
  homeTeam?: TeamPartial;
  awayTeam?: TeamPartial;
  homeTeamId?: string;
  awayTeamId?: string;
  odds?: Odds;
  result?: Score;
  venue?: string;
  allPredictionPointsCalculated?: boolean;
  externalReference?: any;
  prediction?: Prediction | undefined | null;
  [key: string]: any;
}

const { ObjectId, Mixed } = Schema.Types;

export const matchSchema = schema({
  season: { type: ObjectId, ref: 'Season', index: true, required: true },
  slug: { type: String, required: true, trim: true },
  matchday: { type: Number },
  gameRound: { type: ObjectId, ref: 'GameRound', index: true, required: true },
  utcDate: { type: Date, required: true },
  homeTeam: {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    crestUrl: { type: String },
    id: { type: ObjectId, ref: 'Team', index: true, required: true },
  },
  awayTeam: {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    crestUrl: { type: String },
    id: { type: ObjectId, ref: 'Team', index: true, required: true },
  },
  status: {
    type: String,
    required: true,
    enum: [
      'SCHEDULED',
      'LIVE',
      'CANCELED',
      'POSTPONED',
      'FINISHED',
    ],
  },
  result: {
    goalsHomeTeam: { type: Number },
    goalsAwayTeam: { type: Number },
  },
  odds: {
    homeWin: { type: Number, default: 1 },
    awayWin: { type: Number, default: 1 },
    draw: { type: Number, default: 1 },
  },
  venue: { type: String, trim: true },
  allPredictionPointsCalculated: { type: Boolean, default: false },
  externalReference: { type: Mixed },
});

const MatchModel = model<Match>('Match', matchSchema);

export default MatchModel;
