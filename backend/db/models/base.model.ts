import { Document } from 'mongoose';

export interface Entity {
  id?: string;
}

export interface DocumentEntity extends Entity, Document {
  id?: string;
}
