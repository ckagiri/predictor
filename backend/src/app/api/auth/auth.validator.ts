import Joi from 'joi';

import { JoiValidator } from '../common/validation/validatorWrapper.js';

const userAuthSchema = Joi.object({
  password: Joi.string().min(6).required(),
  username: Joi.string().min(4),
});

export const userAuthValidator = new JoiValidator(userAuthSchema);
