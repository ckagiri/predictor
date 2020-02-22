import { Schema, model } from 'mongoose';

import { Entity, DocumentEntity } from './base.model';

export interface LeagueEntity extends Entity {
  name: string;
  slug: string;
  code?: string;
}

export interface ILeagueDocument extends LeagueEntity, DocumentEntity { }

export const leagueSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  code: { type: String, default: '' },
});

export const League = model<ILeagueDocument>('League', leagueSchema);
