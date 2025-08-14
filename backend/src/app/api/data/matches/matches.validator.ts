/* eslint-disable perfectionist/sort-objects */
import Joi from 'joi';

import { slugStringSchema } from '../../common/validation/schemas.js';
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

const UpdateMatchSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
  slug: slugStringSchema.required(),
  matchDetails: Joi.object({
    gameRound: Joi.string().max(20).required(),
    matchday: Joi.number().integer().min(1).max(50).required(),
    odds: oddsSchema.optional(),
    score: scoreSchema.optional(),
    status: Joi.string()
      .valid(
        'SCHEDULED',
        'LIVE',
        'CANCELED',
        'SUSPENDED',
        'POSTPONED',
        'FINISHED'
      )
      .required(),
    utcDate: Joi.date().optional(),
    venue: Joi.string().max(100).optional(),
  }),
});

export const updateMatchValidator = new JoiValidator(UpdateMatchSchema);

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
