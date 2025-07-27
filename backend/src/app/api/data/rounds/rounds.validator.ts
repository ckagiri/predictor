import Joi from 'joi';

import { slugStringSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetRoundsSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
});

export const getRoundsValidator = new JoiValidator(GetRoundsSchema);

const GetRoundSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
  slug: Joi.string().max(20).required(),
});

export const getRoundValidator = new JoiValidator(GetRoundSchema);
