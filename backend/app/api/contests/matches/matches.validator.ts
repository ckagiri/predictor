import Joi from 'joi';

import { slugStringSchema } from '../../common/validation/schemas.js';
import { JoiValidator } from '../../common/validation/validatorWrapper';

const GetCompetitionMatchesSchema = Joi.object({
  competition: slugStringSchema.required(),
});

export const getCompetitionMatchesValidator = new JoiValidator(
  GetCompetitionMatchesSchema
);
