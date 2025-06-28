import Joi from 'joi';

import { slugStringSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetTeamSchema = Joi.object({
  slug: slugStringSchema.required(),
});

export const getTeamValidator = new JoiValidator(GetTeamSchema);
