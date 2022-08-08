import { Schema, model } from 'mongoose';

import { Entity, schema } from './base.model';
import { Score, Odds } from '../../common/score';
import { Prediction } from './prediction.model';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PLAY = 'IN_PLAY',
  CANCELED = 'CANCELED',
  POSTPONED = 'POSTPONED',
  FINISHED = 'FINISHED',
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
  matchRound?: number;
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
  allGlobalLeaderboardScoresProcessed?: boolean;
  externalReference?: any;
  prediction?: Prediction | undefined | null;
  [key: string]: any;
}

const { ObjectId, Mixed } = Schema.Types;

export const matchSchema = schema({
  season: { type: ObjectId, ref: 'Season', index: true, required: true },
  slug: { type: String, required: true, trim: true },
  matchRound: { type: Number },
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
      'IN_PLAY',
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
  allGlobalLeaderboardScoresProcessed: { type: Boolean, default: false },
  externalReference: { type: Mixed },
});

const MatchModel = model<Match>('Match', matchSchema);

export default MatchModel;
