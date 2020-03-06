import { Schema, model } from 'mongoose';

import { Entity, DocumentEntity } from './base.model';

export interface Competition extends Entity {
  name: string;
  slug: string;
  code?: string;
}

export interface CompetitionDocument extends Competition, DocumentEntity { }

export const competitionSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  code: { type: String, default: '' },
});

const CompetitionModel = model<CompetitionDocument>(
  'Competition',
  competitionSchema,
);

export default CompetitionModel;
