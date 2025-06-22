import Joi from 'joi';

import { JoiValidator } from '../../common/validation/validatorWrapper.js';

const GetTeamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^\d+$/, { invert: true })
    .messages({
      'string.pattern.invert.base':
        '{{#label}} with value {:[.]} is not a valid identifier',
    })
    .required(),
}).required();

export const getTeamValidator = new JoiValidator(GetTeamSchema);
