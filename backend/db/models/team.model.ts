import { Schema, model } from 'mongoose';

import { Entity, DocumentEntity } from './base.model';

export interface TeamEntity extends Entity {
  id?: string;
  name: string;
  slug?: string;
  shortName?: string;
  code?: string;
  aliases?: string[];
  crestUrl?: string;
  externalReference?: any;
}

export interface TeamDocument extends TeamEntity, DocumentEntity {}

const { Mixed } = Schema.Types;

export const teamSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  shortName: { type: String, trim: true },
  code: { type: String },
  aliases: { type: [String] },
  crestUrl: { type: String },
  externalReference: { type: Mixed },
});

export const Team = model<TeamDocument>('Team', teamSchema);
