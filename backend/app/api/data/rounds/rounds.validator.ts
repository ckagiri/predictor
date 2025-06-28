import Joi from 'joi';

import { validSlugSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetRoundSchema = Joi.object({
  competition: validSlugSchema.required(),
  season: Joi.string().min(4).max(9).required(),
  slug: Joi.string().max(20),
});

const GetRoundsSchema = Joi.object({
  competition: validSlugSchema.required(),
  season: Joi.string().min(4).max(9).required(),
});

export const getRoundValidator = new JoiValidator(GetRoundSchema);
export const getRoundsValidator = new JoiValidator(GetRoundsSchema);
