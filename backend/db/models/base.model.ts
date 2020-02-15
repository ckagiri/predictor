import { Document } from "mongoose";

export interface IEntity {
  id?: string;
}

export interface IDocumentEntity extends IEntity, Document {
  id?: string;
}
