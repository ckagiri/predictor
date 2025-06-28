import Joi from 'joi';

import { slugStringSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetSeasonsSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getSeasonsValidator = new JoiValidator(GetSeasonsSchema);

const GetSeasonSchema = Joi.object({
  competition: slugStringSchema.required(),
  slug: Joi.string().min(4).max(9).required(),
});

export const getSeasonValidator = new JoiValidator(GetSeasonSchema);
