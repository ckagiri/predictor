import { Schema, model } from 'mongoose';
import { Entity, DocumentEntity, schema } from './base.model';

export enum STATUS {
  UPDATING = 'UPDATING',
  UPDATED = 'UPDATED',
}

export enum BOARD_TYPE {
  GLOBAL_SEASON = 'GLOBAL_SEASON',
  GLOBAL_ROUND = 'GLOBAL_ROUND',
}
export interface Leaderboard extends Entity {
  id?: string;
  season: string;
  year?: number;
  month?: number;
  gameRound?: string;
  status?: STATUS;
  boardType?: BOARD_TYPE;
  userCount?: number;
  lastStatusUpdate?: Date;
}

export interface LeaderboardDocument extends Leaderboard, DocumentEntity { }

const { ObjectId } = Schema.Types;

const leaderboardSchema = schema({
  season: { type: ObjectId, ref: 'Season', index: true },
  gameRound: { type: ObjectId, ref: 'GameRound', index: true },
  year: { type: Number, index: true },
  month: { type: Number, index: true },
  status: {
    type: String,
    enum: [STATUS.UPDATING, STATUS.UPDATED],
    default: STATUS.UPDATED,
  },
  boardType: {
    type: String,
    required: true,
    enum: [
      BOARD_TYPE.GLOBAL_SEASON,
      BOARD_TYPE.GLOBAL_ROUND,
    ],
  },
  userCount: { type: Number },
  lastStatusUpdate: { type: Schema.Types.Date },
});

const LeaderboardModel = model<LeaderboardDocument>(
  'Leaderboard',
  leaderboardSchema,
);

export default LeaderboardModel;
