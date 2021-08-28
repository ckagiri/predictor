import { Schema, model } from 'mongoose';
import { Entity, DocumentEntity, schema } from './base.model';

export interface GameRound extends Entity {
  season?: string;
  name: string;
  position?: number;
}

export interface GameRoundDocument extends GameRound, DocumentEntity {}

const GameRoundSchema = schema({
  season: { type: Schema.Types.ObjectId, ref: 'Season', index: true, required: true },
  name: { type: String, required: true },
  position: { type: Number, required: true },
});

const GameRoundModel = model<GameRoundDocument>(
  'GameRound',
  GameRoundSchema,
);

export default GameRoundModel;