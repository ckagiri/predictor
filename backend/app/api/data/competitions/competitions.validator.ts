import Joi from 'joi';

import { validSlugSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetCompetitionSchema = Joi.object({
  slug: validSlugSchema.required(),
});

export const getCompetitionValidator = new JoiValidator(GetCompetitionSchema);
