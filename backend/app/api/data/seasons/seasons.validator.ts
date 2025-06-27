import Joi from 'joi';

import { validSlugSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetSeasonSchema = Joi.object({
  competition: validSlugSchema.required(),
  slug: validSlugSchema.required(),
});

const GetSeasonsSchema = Joi.object({
  competition: validSlugSchema.required(),
});

export const getSeasonValidator = new JoiValidator(GetSeasonSchema);
export const getSeasonsValidator = new JoiValidator(GetSeasonsSchema);
