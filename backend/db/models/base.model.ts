import { Document } from 'mongoose';

export interface Entity {
  id?: string;
}

export interface IDocumentEntity extends Entity, Document {
  id?: string;
}
