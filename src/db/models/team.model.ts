import { Schema, Model, model, Document } from "mongoose";

import { IEntity, IDocumentEntity } from "./base.model";

export interface ITeam extends IEntity {
  id?: string;
  name: string;
  slug?: string;
  shortName?: string;
  code?: string;
  aliases?: string[];
  crestUrl?: string;
  externalReference?: any;
}

export interface ITeamDocument extends ITeam, IDocumentEntity {}

const { Mixed } = Schema.Types;

export const teamSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, trim: true },
  shortName: { type: String, trim: true },
  code: { type: String },
  aliases: { type: [String] },
  crestUrl: { type: String },
  externalReference: { type: Mixed }
});

export const Team = model<ITeamDocument>("Team", teamSchema);
