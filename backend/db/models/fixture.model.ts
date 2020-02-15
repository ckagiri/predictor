import mongoose, { Schema, model } from 'mongoose';
mongoose.set('useCreateIndex', true);

import { IEntity, IDocumentEntity } from './base.model';
import { Score, Odds } from '../../common/score';

export enum FixtureStatus {
  SCHEDULED = 'SCHEDULED',
  TIMED = 'TIMED',
  IN_PLAY = 'IN_PLAY',
  CANCELED = 'CANCELED',
  POSTPONED = 'POSTPONED',
  FINISHED = 'FINISHED',
}

export interface IFixture extends IEntity {
  id?: string;
  season?: string;
  slug: string;
  date?: any;
  matchRound?: number;
  gameRound?: number;
  status?: FixtureStatus;
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

export interface IFixtureDocument extends IFixture, IDocumentEntity {}

const { ObjectId, Mixed } = Schema.Types;

export const fixtureSchema = new Schema({
  season: { type: ObjectId, ref: 'Season', index: true, required: true },
  slug: { type: String, required: true, trim: true },
  matchRound: { type: Number, required: true },
  gameRound: { type: Number },
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

export const Fixture = model<IFixtureDocument>('Fixture', fixtureSchema);
