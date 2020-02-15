import mongoose from "mongoose";
mongoose.set("useCreateIndex", true);
import { Schema, model } from "mongoose";

import { IEntity, IDocumentEntity } from "./base.model";

export interface ILeaderboard extends IEntity {
  id?: string;
  season: string;
  year?: number;
  month?: number;
  gameRound?: number;
  status?: BoardStatus;
  boardType?: BoardType;
  userCount?: number;
  lastStatusUpdate?: Date;
}

export interface ILeaderboardDocument extends ILeaderboard, IDocumentEntity {}

export enum BoardStatus {
  UPDATING_SCORES = "UPDATING_SCORES",
  UPDATING_RANKINGS = "UPDATING_RANKINGS",
  REFRESHED = "REFRESHED"
}

export enum BoardType {
  GLOBAL_SEASON = "GLOBAL_SEASON",
  GLOBAL_ROUND = "GLOBAL_ROUND",
  GLOBAL_MONTH = "GLOBAL_MONTH",
  MINI_LEAGUE = "MINI_LEAGUE"
}

const { ObjectId } = Schema.Types;
const Status = BoardStatus;

const leaderboardSchema = new Schema({
  season: { type: ObjectId, ref: "Season", index: true },
  gameRound: { type: Number, index: true },
  year: { type: Number, index: true },
  month: { type: Number, index: true },
  status: {
    type: String,
    enum: [Status.REFRESHED, Status.UPDATING_SCORES, Status.UPDATING_RANKINGS],
    default: Status.REFRESHED
  },
  boardType: {
    type: String,
    enum: [
      BoardType.GLOBAL_SEASON,
      BoardType.GLOBAL_MONTH,
      BoardType.GLOBAL_ROUND,
      BoardType.MINI_LEAGUE
    ]
  },
  userCount: { type: Number },
  lastStatusUpdate: { type: Schema.Types.Date }
});

export const Leaderboard = model<ILeaderboardDocument>(
  "Leaderboard",
  leaderboardSchema
);
