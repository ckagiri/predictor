import Joi from 'joi';

export const slugStringSchema = Joi.string()
  .max(20)
  .pattern(/^\d+$/, { invert: true })
  .messages({
    'string.pattern.invert.base':
      '{{#label}} with value {:[.]} is not a valid identifier',
  })
  .pattern(/^[0-9a-fA-F]{24}$/, { invert: true })
  .message('ObjectID is not a valid identifier');
