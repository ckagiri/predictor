import { model } from 'mongoose';
import { Entity, DocumentEntity, schema } from './base.model';

export interface Competition extends Entity {
  name: string;
  slug: string;
  code?: string;
}

export interface CompetitionDocument extends Competition, DocumentEntity {}

const competitionSchema = schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  code: { type: String, default: '' },
});

const CompetitionModel = model<CompetitionDocument>(
  'Competition',
  competitionSchema,
);

export default CompetitionModel;
