import Joi from 'joi';

import { slugStringSchema } from '../common/validation/schemas.js';
import { JoiValidator } from '../common/validation/validatorWrapper.js';

const GetCompetitionSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getCompetitionValidator = new JoiValidator(GetCompetitionSchema);

const GetRoundMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
  round: Joi.string().max(20),
  season: Joi.string().min(4).max(9),
});

export const getRoundMatchesValidator = new JoiValidator(GetRoundMatchesSchema);
