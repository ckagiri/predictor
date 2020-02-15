import mongoose, { Schema, model } from 'mongoose';
mongoose.set('useCreateIndex', true);

import { IEntity, IDocumentEntity } from './base.model';

export interface ILeaderboard extends IEntity {
  id?: string;
  season: string;
  year?: number;
  month?: number;
  gameRound?: number;
  status?: BOARD_STATUS;
  boardType?: BOARD_TYPE;
  userCount?: number;
  lastStatusUpdate?: Date;
}

export interface ILeaderboardDocument extends ILeaderboard, IDocumentEntity {}

export enum BOARD_STATUS {
  UPDATING_SCORES = 'UPDATING_SCORES',
  UPDATING_RANKINGS = 'UPDATING_RANKINGS',
  REFRESHED = 'REFRESHED',
}

export enum BOARD_TYPE {
  GLOBAL_SEASON = 'GLOBAL_SEASON',
  GLOBAL_ROUND = 'GLOBAL_ROUND',
  GLOBAL_MONTH = 'GLOBAL_MONTH',
  MINI_LEAGUE = 'MINI_LEAGUE',
}

const { ObjectId } = Schema.Types;
const STATUS = BOARD_STATUS;

const leaderboardSchema = new Schema({
  season: { type: ObjectId, ref: 'Season', index: true },
  gameRound: { type: Number, index: true },
  year: { type: Number, index: true },
  month: { type: Number, index: true },
  status: {
    type: String,
    enum: [STATUS.REFRESHED, STATUS.UPDATING_SCORES, STATUS.UPDATING_RANKINGS],
    default: STATUS.REFRESHED,
  },
  boardType: {
    type: String,
    enum: [
      BOARD_TYPE.GLOBAL_SEASON,
      BOARD_TYPE.GLOBAL_MONTH,
      BOARD_TYPE.GLOBAL_ROUND,
      BOARD_TYPE.MINI_LEAGUE,
    ],
  },
  userCount: { type: Number },
  lastStatusUpdate: { type: Schema.Types.Date },
});

export const Leaderboard = model<ILeaderboardDocument>(
  'Leaderboard',
  leaderboardSchema,
);
