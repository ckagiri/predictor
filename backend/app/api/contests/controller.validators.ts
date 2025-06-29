import Joi from 'joi';

import { slugStringSchema } from '../common/validation/schemas';
import { JoiValidator } from '../common/validation/validatorWrapper';

const GetCompetitionSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getCompetitionValidator = new JoiValidator(GetCompetitionSchema);

const GetCompetitionMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getCompetitionMatchesValidator = new JoiValidator(
  GetCompetitionMatchesSchema
);

const GetSeasonMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
});

export const getSeasonMatchesValidator = new JoiValidator(
  GetSeasonMatchesSchema
);

const GetRoundMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
  round: Joi.string().max(20).required(),
  season: Joi.string().min(4).max(9).required(),
});

export const getRoundMatchesValidator = new JoiValidator(GetRoundMatchesSchema);
