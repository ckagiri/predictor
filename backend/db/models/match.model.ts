import mongoose, { Schema, model } from 'mongoose';
mongoose.set('useCreateIndex', true);

import { Entity, DocumentEntity, schema } from './base.model';
import { Score, Odds } from '../../common/score';

export enum MatchStatus {
  SCHEDULED = 'SCHEDULED',
  TIMED = 'TIMED',
  IN_PLAY = 'IN_PLAY',
  CANCELED = 'CANCELED',
  POSTPONED = 'POSTPONED',
  FINISHED = 'FINISHED',
}

export interface Match extends Entity {
  id?: string;
  season?: string;
  slug: string;
  date?: any;
  matchRound?: number;
  gameRound?: string;
  status?: MatchStatus;
  homeTeam?: {
    name: string;
    slug: string;
    crestUrl: string;
    id: string;
  };
  awayTeam?: {
    name: string;
    slug: string;
    crestUrl: string;
    id: string;
  };
  odds?: Odds;
  result?: Score;
  venue?: string;
  allPredictionsProcessed?: boolean;
  externalReference?: any;
  [key: string]: any;
}

export interface MatchDocument extends Match, DocumentEntity {}

const { ObjectId, Mixed } = Schema.Types;

export const matchSchema = schema({
  season: { type: ObjectId, ref: 'Season', index: true, required: true },
  slug: { type: String, required: true, trim: true },
  matchRound: { type: Number },
  gameRound: { type: ObjectId, ref: 'GameRound', index: true, required: true },
  date: { type: Date, required: true },
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
      'TIMED',
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
  allPredictionsProcessed: { type: Boolean, default: false },
  externalReference: { type: Mixed },
});

const MatchModel = model<MatchDocument>('Match', matchSchema);

export default MatchModel;
