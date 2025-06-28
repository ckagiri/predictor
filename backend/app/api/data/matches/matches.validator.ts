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
