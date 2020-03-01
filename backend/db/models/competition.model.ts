import { Schema, model } from 'mongoose';

import { Entity, DocumentEntity } from './base.model';

export interface CompetitionModel extends Entity {
  name: string;
  slug: string;
  code?: string;
}

export interface CompetitionDocument extends CompetitionModel, DocumentEntity {}

export const competitionSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  code: { type: String, default: '' },
});

export const Competition = model<CompetitionDocument>(
  'Competition',
  competitionSchema,
);
