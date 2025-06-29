import Joi from 'joi';

import { slugStringSchema } from '../common/validation/schemas';
import { JoiValidator } from '../common/validation/validatorWrapper';

const GetCompetitionSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getCompetitionValidator = new JoiValidator(GetCompetitionSchema);
