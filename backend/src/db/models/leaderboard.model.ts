import { model, Schema } from 'mongoose';

import { Entity, schema } from './base.model';

export enum BOARD_TYPE {
  GLOBAL_ROUND = 'GLOBAL_ROUND',
  GLOBAL_SEASON = 'GLOBAL_SEASON',
}
export interface Leaderboard extends Entity {
  boardType?: BOARD_TYPE;
  gameRound?: string;
  lastStatusUpdate?: Date;
  matches?: string[];
  month?: number;
  season: string;
  userCount?: number;
  year?: number;
}

const { ObjectId } = Schema.Types;

const leaderboardSchema = schema({
  boardType: {
    enum: Object.values(BOARD_TYPE),
    required: true,
    type: String,
  },
  gameRound: { index: true, ref: 'GameRound', type: ObjectId },
  lastStatusUpdate: { type: Schema.Types.Date },
  matches: [{ ref: 'Match', type: ObjectId }],
  month: { index: true, type: Number },
  season: { index: true, ref: 'Season', type: ObjectId },
  userCount: { type: Number },
  year: { index: true, type: Number },
});

const LeaderboardModel = model<Leaderboard>('Leaderboard', leaderboardSchema);

export default LeaderboardModel;
