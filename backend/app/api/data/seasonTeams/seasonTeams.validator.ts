import Joi from 'joi';

import { slugStringSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetSeasonTeamsSchema = Joi.object({
  competition: slugStringSchema.required(),
  season: Joi.string().min(4).max(9).required(),
});

export const getSeasonTeamsValidator = new JoiValidator(GetSeasonTeamsSchema);
