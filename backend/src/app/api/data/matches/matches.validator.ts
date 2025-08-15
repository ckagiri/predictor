/* eslint-disable perfectionist/sort-objects */
import Joi from 'joi';

import { MatchStatus } from '../../../../db/models/match.model.js';
import {
  objectIdSchema,
  slugStringSchema,
} from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetSeasonMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
});

export const getSeasonMatchesValidator = new JoiValidator(
  GetSeasonMatchesSchema
);

const GetSeasonMatchSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
  slug: slugStringSchema.required(),
});

export const getSeasonMatchValidator = new JoiValidator(GetSeasonMatchSchema);

const oddsSchema = Joi.object({
  awayWin: Joi.number().required(),
  draw: Joi.number().required(),
  homeWin: Joi.number().required(),
});
const scoreSchema = Joi.object({
  goalsAwayTeam: Joi.number().required(),
  goalsHomeTeam: Joi.number().required(),
});

const UpdateSeasonMatchSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
  slug: slugStringSchema.required(),
  matchDetails: Joi.object({
    gameRound: objectIdSchema,
    matchday: Joi.number().integer().min(1).max(50),
    odds: oddsSchema,
    score: scoreSchema,
    status: Joi.string().valid(...Object.values(MatchStatus)),
    utcDate: Joi.date(),
    venue: Joi.string().max(30),
  }).min(1),
});

export const updateSeasonMatchValidator = new JoiValidator(
  UpdateSeasonMatchSchema
);

const GetRoundMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
});

export const getRoundMatchesValidator = new JoiValidator(GetRoundMatchesSchema);

const GetRoundMatchSchema = Joi.object({
  competition: slugStringSchema.required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
  slug: slugStringSchema.required(),
});

export const getRoundMatchValidator = new JoiValidator(GetRoundMatchSchema);
