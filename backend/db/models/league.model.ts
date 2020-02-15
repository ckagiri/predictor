import { Schema, model } from "mongoose";

import { IEntity, IDocumentEntity } from "./base.model";

export interface ILeague extends IEntity {
  name: string;
  slug: string;
  code?: string;
}

export interface ILeagueDocument extends ILeague, IDocumentEntity {}

export const leagueSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  code: { type: String, default: "" }
});

export const League = model<ILeagueDocument>("League", leagueSchema);
