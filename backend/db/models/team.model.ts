import { Schema, model } from 'mongoose';

import { Entity, DocumentEntity, schema } from './base.model';

export interface Team extends Entity {
  id?: string;
  name: string;
  slug?: string;
  shortName?: string;
  code?: string;
  aliases?: string[];
  crestUrl?: string;
  externalReference?: any;
}

export interface TeamDocument extends Team, DocumentEntity {}

const { Mixed } = Schema.Types;

export const teamSchema = schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  shortName: { type: String, trim: true },
  code: { type: String },
  aliases: { type: [String] },
  crestUrl: { type: String },
  externalReference: { type: Mixed },
});

const TeamModel = model<TeamDocument>('Team', teamSchema);

export default TeamModel;
