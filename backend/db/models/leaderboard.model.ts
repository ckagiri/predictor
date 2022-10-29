import { Schema, model } from 'mongoose';
import { Entity, schema } from './base.model';

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
  boardType?: BOARD_TYPE;
  userCount?: number;
  matches?: string[];
  lastStatusUpdate?: Date;
}

const { ObjectId } = Schema.Types;

const leaderboardSchema = schema({
  season: { type: ObjectId, ref: 'Season', index: true },
  gameRound: { type: ObjectId, ref: 'GameRound', index: true },
  year: { type: Number, index: true },
  month: { type: Number, index: true },
  boardType: {
    type: String,
    required: true,
    enum: Object.values(BOARD_TYPE),
  },
  userCount: { type: Number },
  matches: [{ type: ObjectId, ref: 'Match' }],
  lastStatusUpdate: { type: Schema.Types.Date },
});

const LeaderboardModel = model<Leaderboard>(
  'Leaderboard',
  leaderboardSchema,
);

export default LeaderboardModel;
